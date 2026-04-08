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

export default function YourSavedTripsPage() {
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

  const handleTripPress = (id: string) => {
    // TODO: navigate to that trip's itinerary when Supabase is wired up
    // router.push({ pathname: '/itinerary', params: { tripId: id } });
    router.push('/itinerary');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Logo ── */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>On the </Text>
        <Text style={styles.logoAccent}>GO!</Text>
      </View>

      {/* ── Page heading ── */}
      <Text style={styles.pageHeading}>Your Trips</Text>

      {/* ── Add new trip input ── */}
      <View style={styles.addRow}>
        <View style={styles.addInputWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.lightGray}
            style={styles.addInputIcon}
          />
          <TextInput
            style={styles.addInput}
            placeholder="Add a new trip"
            placeholderTextColor={Colors.lightGray}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(onboarding)/trip-name')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Saved trips section ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Saved Trips</Text>
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
              ? 'No trips yet. Create your first one!'
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

  // ── Logo ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
    marginBottom: 4,
  },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.09,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.09,
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

  // ── Add row ──
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.028,
    gap: 10,
  },
  addInputWrapper: {
    flex: 1,
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
  addInputIcon: {
    marginRight: 8,
  },
  addInput: {
    flex: 1,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.black,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
