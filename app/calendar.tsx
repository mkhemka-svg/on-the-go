import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { loadItems } from '@/constants/itineraryStore';

const { width } = Dimensions.get('window');
const H_PADDING = width * 0.06;

const SELECTED_COLOR  = '#F5C518';
const TODAY_COLOR     = '#2B5BA8';
const DOT_COLOR       = Colors.darkNavy;

// "4/15" + year → "2026-04-15"
function shortToISO(shortDate: string, year: number): string {
  const [m, d] = shortDate.split('/').map(Number);
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildMarkedDates(activityDates: string[], selected: string | null) {
  const result: Record<string, object> = {};

  for (const date of activityDates) {
    result[date] = {
      dots: [{ key: 'activity', color: DOT_COLOR, selectedDotColor: Colors.white }],
    };
  }

  // Selected day: yellow circle (merge with any existing dots)
  if (selected) {
    const existing = (result[selected] as Record<string, unknown>) ?? {};
    result[selected] = {
      ...existing,
      selected: true,
      selectedColor: SELECTED_COLOR,
    };
  }

  return result;
}

// ── Main Screen ───────────────────────────────────────────────

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate,  setSelectedDate]  = useState<string | null>(null);
  const [activityDates, setActivityDates] = useState<string[]>([]);

  useEffect(() => {
    loadItems().then(items => {
      const year = new Date().getFullYear();
      const dates = [...new Set(items.map(i => shortToISO(i.scheduledDate, year)))];
      setActivityDates(dates);
    });
  }, []);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    router.push({ pathname: '/calendar-day', params: { date: day.dateString } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        <Text style={styles.heading}>My Calendar</Text>

        {/* ── Calendar card ── */}
        <View style={styles.calendarCard}>
          <Calendar
            // Start on today's date
            initialDate={new Date().toISOString().split('T')[0]}

            // Dots + selection support
            markingType="multi-dot"
            markedDates={buildMarkedDates(activityDates, selectedDate)}

            // Navigation
            onDayPress={handleDayPress}
            enableSwipeMonths

            // Show adjacent month days greyed out but not interactive
            hideExtraDays={false}
            disableAllTouchEventsForDisabledDays

            // Locale
            firstDay={0}

            // Custom nav arrows
            renderArrow={(direction: 'left' | 'right') => (
              <Ionicons
                name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
                size={22}
                color={Colors.darkNavy}
              />
            )}

            // Theme
            theme={{
              calendarBackground: 'transparent',

              // Month / year header
              monthTextColor: Colors.darkNavy,
              textMonthFontFamily: FontFamily.merriweatherBold,
              textMonthFontSize: width * 0.042,

              // Day-of-week row (Sun Mon Tue …)
              textSectionTitleColor: Colors.lightGray,
              textDayHeaderFontFamily: FontFamily.merriweather,
              textDayHeaderFontSize: width * 0.03,

              // Day numbers
              dayTextColor: Colors.darkNavy,
              textDayFontFamily: FontFamily.merriweather,
              textDayFontSize: width * 0.038,

              // Today
              todayTextColor: TODAY_COLOR,
              todayBackgroundColor: 'transparent',

              // Selected day
              selectedDayBackgroundColor: SELECTED_COLOR,
              selectedDayTextColor: Colors.white,

              // Dots
              dotColor: DOT_COLOR,
              selectedDotColor: Colors.white,

              // Inactive (adjacent months) — greyed out
              textDisabledColor: '#c0c9db',

              // Arrow buttons
              arrowColor: Colors.darkNavy,
            }}

            style={styles.calendar}
          />
        </View>

        {/* ── Legend ── */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Planned activities</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendCircle} />
            <Text style={styles.legendText}>Selected day</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={[styles.legendTodayNum]}>8</Text>
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </View>

      <BottomNavigationBar activeTab="calendar" />
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
    paddingHorizontal: H_PADDING,
    paddingTop: width * 0.02,
    paddingBottom: width * 0.02,
  },
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

  // ── Content ──
  content: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: width * 0.01,
  },
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.07,
    color: Colors.white,
    marginBottom: width * 0.05,
  },

  // ── Calendar card ──
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    paddingVertical: width * 0.02,
  },
  calendar: {
    borderRadius: Radius.xl,
  },

  // ── Legend ──
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.06,
    marginTop: width * 0.05,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DOT_COLOR,
  },
  legendCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SELECTED_COLOR,
  },
  legendTodayNum: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.032,
    color: TODAY_COLOR,
  },
  legendText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.03,
    color: 'rgba(255,255,255,0.85)',
  },
});
