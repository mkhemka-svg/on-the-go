import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';

// Placeholder — will be replaced when CalendarAddingActivityPage is built
export default function CalendarDayPage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();

  const formatted = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.center}>
        <Text style={styles.dateText}>{formatted}</Text>
        <Text style={styles.subText}>CalendarAddingActivityPage — coming soon</Text>
      </View>
      <BottomNavigationBar activeTab="calendar" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.signInBlue },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoText: { fontFamily: FontFamily.acme, fontSize: 32, color: Colors.white },
  logoAccent: { fontFamily: FontFamily.acme, fontSize: 32, color: Colors.yellow },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  dateText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subText: {
    fontFamily: FontFamily.merriweather,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
