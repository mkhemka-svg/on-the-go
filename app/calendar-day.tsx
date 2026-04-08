import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';

const { width } = Dimensions.get('window');
const H_PADDING   = width * 0.05;
const LABEL_W     = 56;           // px — time label column
const SLOT_H      = 72;           // px per hour — fixed so height encodes time
const TIMELINE_START = 10;        // 10 am

// ── Time slot labels 10 am → 8 pm ────────────────────────────
const TIME_SLOTS = [
  '10 am', '11 am', '12 pm', '1 pm', '2 pm',
  '3 pm',  '4 pm',  '5 pm',  '6 pm', '7 pm', '8 pm',
];
const CONTAINER_H = TIME_SLOTS.length * SLOT_H;

// ── Hardcoded placeholder activities ─────────────────────────
// Supabase will supply these filtered by tripId + date later
interface Activity {
  id: string;
  title: string;
  startHour: number;    // 24-h
  startMinute: number;
  durationMinutes: number;
  color: string;
  accentColor: string;
}

const PLACEHOLDER_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Day trip to Newport',
    startHour: 10,
    startMinute: 0,
    durationMinutes: 240,     // 4 h
    color: Colors.darkNavy,
    accentColor: Colors.yellow,
  },
  {
    id: '2',
    title: 'Dinner at Strega',
    startHour: 18,            // 6 pm
    startMinute: 0,
    durationMinutes: 90,      // 1.5 h
    color: '#2563B0',
    accentColor: Colors.lightYellow,
  },
];

// ── Helpers ───────────────────────────────────────────────────

function ordinalSuffix(n: number): string {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function formatDayLabel(dateString: string): string {
  const d = new Date(dateString + 'T12:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const day     = d.getDate();
  const month   = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${day}${ordinalSuffix(day)} ${month}`;
}

function formatTimeRange(a: Activity): string {
  const toAmPm = (h: number, m: number) => {
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12  = h % 12 === 0 ? 12 : h % 12;
    const mm   = m.toString().padStart(2, '0');
    return `${h12}:${mm} ${ampm}`;
  };
  const totalMin = a.startHour * 60 + a.startMinute + a.durationMinutes;
  const endH = Math.floor(totalMin / 60);
  const endM = totalMin % 60;
  return `${toAmPm(a.startHour, a.startMinute)} – ${toAmPm(endH, endM)}`;
}

// ── Block geometry helpers ────────────────────────────────────
function blockTop(a: Activity): number {
  return (a.startHour - TIMELINE_START + a.startMinute / 60) * SLOT_H;
}
function blockHeight(a: Activity): number {
  return (a.durationMinutes / 60) * SLOT_H;
}

// ── Main Screen ───────────────────────────────────────────────

export default function CalendarDayPage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router   = useRouter();

  const dateLabel = date ? formatDayLabel(date) : 'Selected Day';

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

        {/* Right spacer to keep logo centered */}
        <View style={styles.backBtn} />
      </View>

      {/* ── Section label + date ── */}
      <View style={styles.labelBlock}>
        <Text style={styles.sectionLabel}>My Calendar</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>

      {/* ── Day view card ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          {/* ── Timeline ── */}
          <View style={{ height: CONTAINER_H, position: 'relative' }}>

            {/* Time slot rows */}
            {TIME_SLOTS.map((label, i) => (
              <View
                key={label}
                style={[styles.slotRow, { top: i * SLOT_H }]}
                pointerEvents="none"
              >
                <Text style={styles.timeLabel}>{label}</Text>
                <View style={styles.slotLine} />
              </View>
            ))}

            {/* Activity blocks */}
            {PLACEHOLDER_ACTIVITIES.map(activity => (
              <View
                key={activity.id}
                style={[
                  styles.activityBlock,
                  {
                    top: blockTop(activity),
                    height: blockHeight(activity),
                    backgroundColor: activity.color,
                    borderLeftColor: activity.accentColor,
                  },
                ]}
              >
                <Text style={styles.activityTitle} numberOfLines={2}>
                  {activity.title}
                </Text>
                <Text style={styles.activityTime}>
                  {formatTimeRange(activity)}
                </Text>
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
        </View>
      </ScrollView>

      <BottomNavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.signInBlue,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop: width * 0.02,
    paddingBottom: width * 0.01,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.085,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.085,
    color: Colors.yellow,
  },

  // ── Labels ──
  labelBlock: {
    paddingHorizontal: H_PADDING,
    paddingBottom: width * 0.04,
  },
  sectionLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.07,
    color: Colors.white,
    marginBottom: 2,
  },
  dateLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: width * 0.06,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  // ── Time slot rows ──
  slotRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SLOT_H,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeLabel: {
    width: LABEL_W,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.03,
    color: Colors.lightGray,
    paddingTop: 4,
    textAlign: 'right',
    paddingRight: 10,
  },
  slotLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e6eaf2',
    marginTop: 9,   // aligns with top of label text
  },

  // ── Activity blocks ──
  activityBlock: {
    position: 'absolute',
    left: LABEL_W + 6,
    right: 0,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  activityTitle: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.034,
    color: Colors.white,
    marginBottom: 3,
  },
  activityTime: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.028,
    color: 'rgba(255,255,255,0.8)',
  },
  durationPill: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.026,
    color: 'rgba(255,255,255,0.75)',
  },
});
