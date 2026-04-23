import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture, ScrollView } from 'react-native-gesture-handler';
import ReanimatedLib, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { loadItems } from '@/constants/itineraryStore';

const { width } = Dimensions.get('window');
const H_PADDING      = width * 0.05;
const LABEL_W        = 44;
const SLOT_H         = 72;
const TIMELINE_START = 10;
const CARD_W         = width - 2 * H_PADDING;
const COL_W          = (CARD_W - LABEL_W) / 7;

const TIME_SLOTS = [
  '10 am', '11 am', '12 pm', '1 pm', '2 pm',
  '3 pm',  '4 pm',  '5 pm',  '6 pm', '7 pm', '8 pm',
];
const CONTAINER_H  = TIME_SLOTS.length * SLOT_H;
const DAY_ABBREVS  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ── Types ─────────────────────────────────────────────────────

interface Activity {
  id: string;
  title: string;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color: string;
  accentColor: string;
  dayOffset: number; // 0 = Mon … 6 = Sun within displayed week
}

// ── Color palette cycled across loaded activities ─────────────

const PALETTE = [
  { color: Colors.darkNavy, accentColor: Colors.yellow },
  { color: '#2563B0',       accentColor: Colors.lightYellow },
  { color: '#1a7a4a',       accentColor: Colors.lightYellow },
  { color: '#7c3aed',       accentColor: '#ede9fe' },
  { color: '#b45309',       accentColor: '#fef3c7' },
];

// "1:00 pm" → { hour: 13, minute: 0 }
function parseTime(scheduledTime: string): { hour: number; minute: number } {
  const m = scheduledTime.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return { hour: 10, minute: 0 };
  let hour = parseInt(m[1]);
  const minute = parseInt(m[2]);
  const ampm = m[3].toLowerCase();
  if (ampm === 'pm' && hour !== 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;
  return { hour, minute };
}

// ── Helpers ───────────────────────────────────────────────────

function ordinalSuffix(n: number): string {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function formatDayLabel(dateString: string): string {
  const d       = new Date(dateString + 'T12:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const day     = d.getDate();
  const month   = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${day}${ordinalSuffix(day)} ${month}`;
}

function formatTimeRange(a: Activity): string {
  const fmt = (h: number, m: number) => {
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  const total = a.startHour * 60 + a.startMinute + a.durationMinutes;
  return `${fmt(a.startHour, a.startMinute)} – ${fmt(Math.floor(total / 60), total % 60)}`;
}

function blockTop(a: Activity): number {
  return (a.startHour - TIMELINE_START + a.startMinute / 60) * SLOT_H;
}

function blockHeight(a: Activity): number {
  return Math.max((a.durationMinutes / 60) * SLOT_H, 20);
}

function getWeekDates(dateString: string): Date[] {
  const d           = new Date(dateString + 'T12:00:00');
  const daysFromMon = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const monday      = new Date(d);
  monday.setDate(d.getDate() - daysFromMon);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
}

function offsetDate(dateString: string, days: number): string {
  const d = new Date(dateString + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getDayOffset(dateString: string): number {
  const day = new Date(dateString + 'T12:00:00').getDay();
  return day === 0 ? 6 : day - 1;
}

// ── Main Screen ───────────────────────────────────────────────

export default function CalendarDayPage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router   = useRouter();

  const [viewMode,   setViewMode]   = useState<'day' | 'week'>('day');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dragging,   setDragging]   = useState<Activity | null>(null);
  const [hoverDay,   setHoverDay]   = useState<number | null>(null);

  const dragX       = useSharedValue(0);
  const dragY       = useSharedValue(0);
  const dragOpacity = useSharedValue(0);
  const slideX      = useSharedValue(0);

  const safeDate          = date ?? new Date().toISOString().split('T')[0];
  const weekDates         = getWeekDates(safeDate);
  const selectedDayOffset = getDayOffset(safeDate);

  // Load itinerary items from the shared store and map to Activity shape
  useEffect(() => {
    loadItems().then(items => {
      const monday = weekDates[0]; // T12:00:00 noon
      const MS_PER_DAY = 24 * 60 * 60 * 1000;

      const mapped: Activity[] = [];
      items.forEach((item, idx) => {
        const [m, d] = item.scheduledDate.split('/').map(Number);
        const itemDate = new Date(
          `${monday.getFullYear()}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T12:00:00`
        );
        const dayOffset = Math.round((itemDate.getTime() - monday.getTime()) / MS_PER_DAY);
        if (dayOffset < 0 || dayOffset > 6) return; // outside this week

        const { hour, minute } = parseTime(item.scheduledTime);
        const { color, accentColor } = PALETTE[idx % PALETTE.length];
        mapped.push({
          id:              item.id,
          title:           item.title,
          startHour:       hour,
          startMinute:     minute,
          durationMinutes: 60,
          color,
          accentColor,
          dayOffset,
        });
      });
      setActivities(mapped);
    });
  }, [safeDate]); // reload when the viewed date changes (day swipe)

  // ── Drag callbacks (JS thread) ───────────────────────────────

  const onDragStart = useCallback((activity: Activity) => {
    setDragging(activity);
  }, []);

  const onDragMove = useCallback((absoluteX: number) => {
    const relX = absoluteX - H_PADDING - LABEL_W;
    setHoverDay(Math.max(0, Math.min(6, Math.floor(relX / COL_W))));
  }, []);

  const onDragEnd = useCallback((activityId: string, absoluteX: number) => {
    const relX      = absoluteX - H_PADDING - LABEL_W;
    const targetDay = Math.max(0, Math.min(6, Math.floor(relX / COL_W)));
    setActivities(prev =>
      prev.map(a => a.id === activityId ? { ...a, dayOffset: targetDay } : a)
    );
    setDragging(null);
    setHoverDay(null);
  }, []);

  const onDragCancel = useCallback(() => {
    setDragging(null);
    setHoverDay(null);
  }, []);

  const navigateDay = useCallback((direction: number) => {
    slideX.value = 0;
    router.replace({ pathname: '/calendar-day', params: { date: offsetDate(safeDate, direction) } });
  }, [safeDate, router, slideX]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-40, 40])   // only activate for horizontal movement
    .failOffsetY([-15, 15])     // give up if user is scrolling vertically
    .onUpdate((e) => {
      slideX.value = e.translationX;
    })
    .onEnd((e) => {
      const bigEnough = Math.abs(e.translationX) > 60 || Math.abs(e.velocityX) > 400;
      if (bigEnough) {
        const direction = e.translationX > 0 ? -1 : 1;
        slideX.value = withTiming(direction > 0 ? -width : width, { duration: 200 }, () => {
          runOnJS(navigateDay)(direction);
        });
      } else {
        slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    })
    .onFinalize(() => {
      // spring back if gesture was cancelled (e.g. interrupted by scroll)
      if (slideX.value !== 0) {
        slideX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  // ── Overlay animated style ───────────────────────────────────

  const overlayStyle = useAnimatedStyle(() => ({
    left:    dragX.value,
    top:     dragY.value,
    opacity: dragOpacity.value,
  }));

  const cardSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  // ── Build gesture for a single activity ──────────────────────

  const makeGesture = (activity: Activity) => {
    // Pre-compute as a plain number — worklet closures can capture primitives
    // but cannot call regular JS functions like blockHeight().
    const bh = blockHeight(activity);

    const longPress = Gesture.LongPress()
      .minDuration(400)
      .maxDistance(999)   // don't cancel on movement
      .onStart((e) => {
        dragX.value       = e.absoluteX - COL_W / 2;
        dragY.value       = e.absoluteY - bh / 2;
        dragOpacity.value = withTiming(1, { duration: 120 });
        runOnJS(onDragStart)(activity);
      });

    const pan = Gesture.Pan()
      .activateAfterLongPress(400)
      .onChange((e) => {
        dragX.value = e.absoluteX - COL_W / 2;
        dragY.value = e.absoluteY - bh / 2;
        runOnJS(onDragMove)(e.absoluteX);
      })
      .onEnd((e) => {
        dragOpacity.value = withTiming(0, { duration: 120 });
        runOnJS(onDragEnd)(activity.id, e.absoluteX);
      })
      .onFinalize(() => {
        dragOpacity.value = withTiming(0, { duration: 120 });
        runOnJS(onDragCancel)();
      });

    return Gesture.Simultaneous(longPress, pan);
  };

  // ── Group activities by day for week view ────────────────────

  const byDay: Record<number, Activity[]> = {};
  for (let i = 0; i < 7; i++) byDay[i] = [];
  for (const a of activities) byDay[a.dayOffset].push(a);

  const dayActivities = activities.filter(a => a.dayOffset === selectedDayOffset);

  // ── Render ───────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* ── Section label + Day/Week toggle ── */}
      <View style={styles.labelBlock}>
        <Text style={styles.sectionLabel}>My Calendar</Text>
        <View style={styles.subRow}>
          <Text style={styles.dateLabel} numberOfLines={1}>
            {viewMode === 'day' ? formatDayLabel(safeDate) : 'Weekly View'}
          </Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'day' && styles.toggleBtnActive]}
              onPress={() => setViewMode('day')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'week' && styles.toggleBtnActive]}
              onPress={() => setViewMode('week')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={dragging === null}
      >
        {viewMode === 'day' ? (
          <GestureDetector gesture={swipeGesture}>
            <ReanimatedLib.View style={[styles.card, cardSlideStyle]}>
              <View style={{ height: CONTAINER_H, position: 'relative' }}>
              {TIME_SLOTS.map((label, i) => (
                <View key={label} style={[styles.slotRow, { top: i * SLOT_H }]} pointerEvents="none">
                  <Text style={styles.timeLabel}>{label}</Text>
                  <View style={styles.slotLine} />
                </View>
              ))}
              {dayActivities.map(activity => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityBlock,
                    {
                      top:             blockTop(activity),
                      height:          blockHeight(activity),
                      backgroundColor: activity.color,
                      borderLeftColor: activity.accentColor,
                    },
                  ]}
                >
                  <Text style={styles.activityTitle} numberOfLines={2}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{formatTimeRange(activity)}</Text>
                  {blockHeight(activity) >= SLOT_H * 1.5 && (
                    <View style={styles.durationPill}>
                      <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.durationText}>
                        {activity.durationMinutes >= 60
                          ? `${activity.durationMinutes / 60}h`
                          : `${activity.durationMinutes}m`}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              </View>
            </ReanimatedLib.View>
          </GestureDetector>
        ) : (
          <View style={styles.card}>
            <>
              {/* Day-of-week header */}
              <View style={styles.weekHeader}>
                <View style={{ width: LABEL_W }} />
                {weekDates.map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.weekDayCell,
                      i === selectedDayOffset && styles.weekDayCellSelected,
                      hoverDay === i && styles.weekDayCellHover,
                    ]}
                  >
                    <Text style={[styles.weekDayAbbrev, i === selectedDayOffset && styles.weekDayAbbrevSelected]}>
                      {DAY_ABBREVS[i]}
                    </Text>
                    <Text style={[styles.weekDayNum, i === selectedDayOffset && styles.weekDayNumSelected]}>
                      {d.getDate()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Timeline + activity columns */}
              <View style={{ height: CONTAINER_H, position: 'relative' }}>

                {/* Time slot rules */}
                {TIME_SLOTS.map((label, i) => (
                  <View key={label} style={[styles.slotRow, { top: i * SLOT_H }]} pointerEvents="none">
                    <Text style={styles.timeLabel}>{label}</Text>
                    <View style={styles.slotLine} />
                  </View>
                ))}

                {/* Column separators */}
                {Array.from({ length: 6 }, (_, i) => (
                  <View
                    key={i}
                    pointerEvents="none"
                    style={[styles.colSep, { left: LABEL_W + (i + 1) * COL_W }]}
                  />
                ))}

                {/* Hover highlight */}
                {hoverDay !== null && (
                  <View
                    pointerEvents="none"
                    style={[styles.hoverHighlight, { left: LABEL_W + hoverDay * COL_W, width: COL_W }]}
                  />
                )}

                {/* Activity blocks per day column */}
                {Array.from({ length: 7 }, (_, dayIdx) => (
                  <View
                    key={dayIdx}
                    pointerEvents="box-none"
                    style={{
                      position: 'absolute',
                      left:     LABEL_W + dayIdx * COL_W + 1,
                      width:    COL_W - 2,
                      top:      0,
                      height:   CONTAINER_H,
                    }}
                  >
                    {byDay[dayIdx].map(activity => {
                      const isDragging = dragging?.id === activity.id;
                      return (
                        <GestureDetector key={activity.id} gesture={makeGesture(activity)}>
                          <View
                            style={{
                              position:        'absolute',
                              top:             blockTop(activity),
                              left:            0,
                              right:           0,
                              height:          blockHeight(activity),
                              backgroundColor: activity.color,
                              borderLeftWidth: 3,
                              borderLeftColor: activity.accentColor,
                              borderRadius:    Radius.sm,
                              opacity:         isDragging ? 0.25 : 1,
                            }}
                          />
                        </GestureDetector>
                      );
                    })}
                  </View>
                ))}
              </View>
            </>
          </View>
        )}

        {viewMode === 'week' && (
          <Text style={styles.dragHint}>Long-press an activity and drag to a new day</Text>
        )}
      </ScrollView>

      {/* ── Drag overlay (floats above everything) ── */}
      <ReanimatedLib.View
        pointerEvents="none"
        style={[styles.dragOverlay, overlayStyle, { width: COL_W, height: dragging ? blockHeight(dragging) : 20 }]}
      >
        {dragging && (
          <View style={[styles.dragOverlayInner, { backgroundColor: dragging.color, borderLeftColor: dragging.accentColor }]}>
            <Text style={styles.dragOverlayText} numberOfLines={2}>{dragging.title}</Text>
          </View>
        )}
      </ReanimatedLib.View>

      <BottomNavigationBar />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.signInBlue,
  },

  // ── Header ──
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop:      width * 0.02,
    paddingBottom:   width * 0.01,
  },
  backBtn:  { width: 36, alignItems: 'flex-start' },
  logoRow:  { flexDirection: 'row', alignItems: 'baseline' },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize:   width * 0.085,
    color:      Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize:   width * 0.085,
    color:      Colors.yellow,
  },

  // ── Labels + toggle ──
  labelBlock: {
    paddingHorizontal: H_PADDING,
    paddingBottom:     width * 0.04,
  },
  sectionLabel: {
    fontFamily:   FontFamily.merriweatherBold,
    fontSize:     width * 0.07,
    color:        Colors.white,
    marginBottom: 6,
  },
  subRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            8,
  },
  dateLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize:   width * 0.034,
    color:      'rgba(255,255,255,0.85)',
    flex:       1,
  },
  toggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius:    Radius.full,
    padding:         3,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical:   5,
    borderRadius:      Radius.full,
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
  },
  toggleText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize:   width * 0.031,
    color:      'rgba(255,255,255,0.8)',
  },
  toggleTextActive: {
    color: Colors.darkNavy,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom:     width * 0.06,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    paddingTop:      12,
    paddingBottom:   12,
    paddingLeft:     12,
    paddingRight:    12,
    shadowColor:     Colors.black,
    shadowOffset:    { width: 0, height: 6 },
    shadowOpacity:   0.1,
    shadowRadius:    12,
    overflow:        'hidden',
  },

  // ── Time slot rows (shared day + week) ──
  slotRow: {
    position:    'absolute',
    left:        0,
    right:       0,
    height:      SLOT_H,
    flexDirection: 'row',
    alignItems:  'flex-start',
  },
  timeLabel: {
    width:      LABEL_W,
    fontFamily: FontFamily.merriweather,
    fontSize:   width * 0.026,
    color:      Colors.lightGray,
    paddingTop: 4,
    textAlign:  'right',
    paddingRight: 6,
  },
  slotLine: {
    flex:            1,
    height:          1,
    backgroundColor: '#e6eaf2',
    marginTop:       9,
  },

  // ── Day view: activity blocks ──
  activityBlock: {
    position:         'absolute',
    left:             LABEL_W + 6,
    right:            0,
    borderRadius:     Radius.md,
    borderLeftWidth:  4,
    paddingHorizontal: 10,
    paddingVertical:  8,
    overflow:         'hidden',
  },
  activityTitle: {
    fontFamily:   FontFamily.merriweatherBold,
    fontSize:     width * 0.034,
    color:        Colors.white,
    marginBottom: 3,
  },
  activityTime: {
    fontFamily: FontFamily.merriweather,
    fontSize:   width * 0.028,
    color:      'rgba(255,255,255,0.8)',
  },
  durationPill: {
    position:    'absolute',
    bottom:      8,
    right:       10,
    flexDirection: 'row',
    alignItems:  'center',
    gap:         3,
  },
  durationText: {
    fontFamily: FontFamily.merriweather,
    fontSize:   width * 0.026,
    color:      'rgba(255,255,255,0.75)',
  },

  // ── Week view header ──
  weekHeader: {
    flexDirection:    'row',
    paddingBottom:    8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6eaf2',
    marginBottom:     4,
  },
  weekDayCell: {
    flex:       1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  weekDayCellSelected: {
    backgroundColor: '#dbeafe',
  },
  weekDayCellHover: {
    backgroundColor: '#fef3b3',
  },
  weekDayAbbrev: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize:   width * 0.028,
    color:      Colors.lightGray,
  },
  weekDayAbbrevSelected: {
    color: Colors.darkNavy,
  },
  weekDayNum: {
    fontFamily: FontFamily.merriweather,
    fontSize:   width * 0.03,
    color:      Colors.lightGray,
    marginTop:  1,
  },
  weekDayNumSelected: {
    color:      Colors.darkNavy,
    fontFamily: FontFamily.merriweatherBold,
  },

  // ── Week view column lines & highlight ──
  colSep: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           1,
    backgroundColor: '#e6eaf2',
  },
  hoverHighlight: {
    position:        'absolute',
    top:             0,
    height:          CONTAINER_H,
    backgroundColor: 'rgba(254,189,25,0.15)',
  },

  // ── Drag hint ──
  dragHint: {
    fontFamily: FontFamily.merriweatherItalic,
    fontSize:   width * 0.03,
    color:      'rgba(255,255,255,0.6)',
    textAlign:  'center',
    marginTop:  10,
  },

  // ── Drag overlay ──
  dragOverlay: {
    position: 'absolute',
    zIndex:   999,
  },
  dragOverlayInner: {
    flex:            1,
    borderLeftWidth: 3,
    borderRadius:    Radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 4,
    overflow:        'hidden',
    shadowColor:     Colors.black,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       8,
  },
  dragOverlayText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize:   width * 0.026,
    color:      Colors.white,
  },
});
