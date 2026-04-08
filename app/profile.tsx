import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

// ── Hardcoded placeholders — replace with Supabase auth data later ──
const USER_NAME    = 'Lily';
const TRIPS_TAKEN  = 3;
const HOURS_SAVED  = 85;

// ── Settings items config ─────────────────────────────────────

interface SettingsItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hasChevron: boolean;
  notificationDot?: boolean;
  isDestructive?: boolean;
  onPress?: () => void;
}

// ── SettingsMenuItem ──────────────────────────────────────────

interface SettingsMenuItemProps {
  item: SettingsItem;
  isLast: boolean;
}

function SettingsMenuItem({ item, isLast }: SettingsMenuItemProps) {
  return (
    <TouchableOpacity
      style={[menuStyles.row, !isLast && menuStyles.rowBorder]}
      onPress={item.onPress}
      activeOpacity={0.6}
    >
      {/* Icon + notification dot wrapper */}
      <View style={menuStyles.iconWrap}>
        <Ionicons
          name={item.icon}
          size={width * 0.055}
          color={item.isDestructive ? Colors.red : Colors.darkNavy}
        />
        {item.notificationDot && <View style={menuStyles.dot} />}
      </View>

      {/* Label */}
      <Text
        style={[
          menuStyles.label,
          item.isDestructive && menuStyles.labelDestructive,
        ]}
      >
        {item.label}
      </Text>

      {/* Chevron */}
      {item.hasChevron && (
        <Ionicons
          name="chevron-forward"
          size={width * 0.045}
          color={Colors.lightGray}
        />
      )}
    </TouchableOpacity>
  );
}

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.05,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e8f5',
  },
  iconWrap: {
    width: width * 0.08,
    alignItems: 'flex-start',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.darkNavy,
  },
  labelDestructive: {
    color: Colors.red,
    fontFamily: FontFamily.merriweatherBold,
  },
});

// ── Main Screen ───────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const SETTINGS_ITEMS: SettingsItem[] = [
    {
      key: 'account',
      icon: 'settings-outline',
      label: 'Account settings',
      hasChevron: true,
      notificationDot: true, // hardcoded visible — conditional when Supabase wired
      onPress: () => {},
    },
    {
      key: 'help',
      icon: 'help-circle-outline',
      label: 'Get help',
      hasChevron: true,
      onPress: () => {},
    },
    {
      key: 'view-profile',
      icon: 'person-outline',
      label: 'View profile',
      hasChevron: true,
      onPress: () => {},
    },
    {
      key: 'privacy',
      icon: 'lock-closed-outline',
      label: 'Privacy',
      hasChevron: true,
      onPress: () => {},
    },
    {
      key: 'logout',
      icon: 'log-out-outline',
      label: 'Log out',
      hasChevron: false,
      isDestructive: true,
      onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/sign-in');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>

        {/* Profile avatar — already on this screen, no navigation */}
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color={Colors.white} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── UserStatsCard ── */}
        <View style={styles.statsCard}>
          {/* Avatar illustration */}
          <View style={styles.userAvatarCircle}>
            <Ionicons name="person" size={width * 0.14} color={Colors.white} />
          </View>

          {/* Name */}
          <Text style={styles.userName}>{USER_NAME}</Text>

          {/* Divider */}
          <View style={styles.statsDivider} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{TRIPS_TAKEN}</Text>
              <Text style={styles.statLabel}>trips taken</Text>
            </View>
            <View style={styles.statsVerticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{HOURS_SAVED}</Text>
              <Text style={styles.statLabel}>hours saved</Text>
            </View>
          </View>
        </View>

        {/* ── PastTripsCard ── */}
        <TouchableOpacity
          style={styles.pastTripsCard}
          onPress={() => router.push('/past-trips')}
          activeOpacity={0.8}
        >
          {/* Memory Lane icon */}
          <View style={styles.memoryLaneIcon}>
            <Ionicons name="time" size={width * 0.09} color={Colors.yellow} />
            <View style={styles.memoryLaneSignPole} />
          </View>

          <View style={styles.pastTripsTextCol}>
            <Text style={styles.pastTripsLabel}>Past trips</Text>
            <Text style={styles.pastTripsSubtitle}>Memory Lane</Text>
          </View>

          <Ionicons name="chevron-forward" size={width * 0.05} color={Colors.lightGray} />
        </TouchableOpacity>

        {/* ── SettingsMenuCard ── */}
        <View style={styles.settingsCard}>
          {SETTINGS_ITEMS.map((item, index) => (
            <SettingsMenuItem
              key={item.key}
              item={item}
              isLast={index === SETTINGS_ITEMS.length - 1}
            />
          ))}
        </View>

        <View style={{ height: height * 0.02 }} />
      </ScrollView>

      {/* ── BottomNavigationBar — no tab active ── */}
      <BottomNavigationBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
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
    paddingBottom: height * 0.02,
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
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.lightYellow,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    gap: height * 0.022,
  },

  // ── UserStatsCard ──
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: height * 0.035,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  userAvatarCircle: {
    width: width * 0.26,
    height: width * 0.26,
    borderRadius: width * 0.13,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.018,
    borderWidth: 3,
    borderColor: Colors.lightYellow,
  },
  userName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.darkNavy,
    marginBottom: height * 0.02,
  },
  statsDivider: {
    width: '85%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c8d8f0',
    marginBottom: height * 0.02,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.08,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.08,
    color: Colors.darkNavy,
  },
  statLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.032,
    color: Colors.lightGray,
    marginTop: 2,
  },
  statsVerticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: height * 0.05,
    backgroundColor: '#c8d8f0',
  },

  // ── PastTripsCard ──
  pastTripsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: height * 0.022,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  memoryLaneIcon: {
    width: width * 0.14,
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  memoryLaneSignPole: {
    width: 3,
    height: height * 0.025,
    backgroundColor: Colors.yellow,
    borderRadius: 2,
    marginTop: 2,
  },
  pastTripsTextCol: {
    flex: 1,
  },
  pastTripsLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.045,
    color: Colors.darkNavy,
  },
  pastTripsSubtitle: {
    fontFamily: FontFamily.merriweatherItalic,
    fontSize: width * 0.032,
    color: Colors.lightGray,
    marginTop: 2,
  },

  // ── SettingsMenuCard ──
  settingsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});
