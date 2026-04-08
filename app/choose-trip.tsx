import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import PersonAvatarIllustration from '@/components/illustrations/PersonAvatarIllustration';
import FloppyDiskIllustration from '@/components/illustrations/FloppyDiskIllustration';

const { width, height } = Dimensions.get('window');

// Placeholder name — will be replaced with Supabase auth user data
const PLACEHOLDER_NAME = 'Manya';

export default function ChooseNewOrSavedTripPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* ── Logo ── */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>On the </Text>
        <Text style={styles.logoAccent}>GO!</Text>
      </View>

      {/* ── User Profile Card ── */}
      <TouchableOpacity
        style={styles.profileCard}
        activeOpacity={0.85}
        // TODO: wire up profile edit sheet when Supabase auth is connected
      >
        <PersonAvatarIllustration size={width * 0.14} />
        <View style={styles.profileTextContainer}>
          <Text style={styles.welcomeLabel}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{PLACEHOLDER_NAME} 👋</Text>
        </View>
        <Ionicons name="pencil" size={18} color={Colors.lightGray} />
      </TouchableOpacity>

      {/* ── Cards ── */}
      <View style={styles.cardsContainer}>

        {/* Create New Trip */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => router.push('/(onboarding)/trip-name')}
        >
          <View style={styles.cardIconWrapper}>
            <Ionicons name="add-circle" size={width * 0.15} color={Colors.darkNavy} />
          </View>
          <Text style={styles.cardLabel}>Create a new trip</Text>
          <Text style={styles.cardSublabel}>Plan something new with your crew</Text>
        </TouchableOpacity>

        {/* Saved Trips */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.88}
          onPress={() => router.push('/saved-trips')}
        >
          <View style={styles.cardIconWrapper}>
            <FloppyDiskIllustration size={width * 0.13} />
          </View>
          <Text style={styles.cardLabel}>Your Saved Trips</Text>
          <Text style={styles.cardSublabel}>Pick up where you left off</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.signInBlue,
    paddingHorizontal: width * 0.06,
  },

  // ── Logo ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: height * 0.025,
    marginBottom: height * 0.032,
  },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.1,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.1,
    color: Colors.yellow,
  },

  // ── Profile Card ──
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.022,
    marginBottom: height * 0.038,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },
  welcomeLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.033,
    color: Colors.lightGray,
    marginBottom: 2,
  },
  welcomeName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.05,
    color: Colors.darkNavy,
  },

  // ── Trip Cards ──
  cardsContainer: {
    flex: 1,
    gap: height * 0.024,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.03,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardIconWrapper: {
    marginBottom: height * 0.018,
  },
  cardLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.052,
    color: Colors.darkNavy,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSublabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: Colors.lightGray,
    textAlign: 'center',
  },
});
