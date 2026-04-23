import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import TripCard, { TripCardData } from '@/components/TripCard';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { loadTrips } from '@/constants/tripStore';

const { width, height } = Dimensions.get('window');

export default function PastTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripCardData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTrips().then(setTrips);
  }, []);

  const filtered = search.trim()
    ? trips.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.location.toLowerCase().includes(search.toLowerCase())
      )
    : trips;

  const handleTripPress = (_id: string) => {
    router.push('/itinerary');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>
        <View style={styles.navBtn} />
      </View>

      {/* ── Page heading ── */}
      <Text style={styles.pageHeading}>Memory Lane</Text>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.lightGray}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search past trips"
            placeholderTextColor={Colors.lightGray}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Section header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Past Trips</Text>
        <Text style={styles.tripCount}>{filtered.length} {filtered.length === 1 ? 'trip' : 'trips'}</Text>
      </View>

      {/* ── Trip card list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {trips.length === 0
              ? 'No past trips yet. Your adventures will appear here!'
              : 'No trips match your search.'}
          </Text>
        ) : (
          filtered.map(trip => (
            <TripCard key={trip.id} trip={trip} onPress={handleTripPress} />
          ))
        )}
      </ScrollView>

      {/* ── Bottom navigation ── */}
      <BottomNavigationBar activeTab={undefined} />
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
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
    paddingBottom: height * 0.01,
  },
  navBtn: {
    width: 40,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
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

  // ── Heading ──
  pageHeading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.072,
    color: Colors.white,
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.022,
  },

  // ── Search row ──
  searchRow: {
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.028,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.black,
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.018,
  },
  sectionLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.045,
    color: Colors.white,
  },
  tripCount: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: Colors.white,
    opacity: 0.7,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  emptyText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: height * 0.06,
  },
});
