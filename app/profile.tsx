import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { loadTrips } from '@/constants/tripStore';

const AVATAR_CACHE_KEY = 'profile_avatar_uri';
const NAME_CACHE_KEY   = 'profile_name';

const { width, height } = Dimensions.get('window');

// hours saved is derived: no DB column exists yet
const HOURS_PER_TRIP = 28;

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

  const [userName,       setUserName]       = useState('');
  const [userEmail,      setUserEmail]      = useState('');
  const [avatarUri,      setAvatarUri]      = useState<string | null>(null);
  const [tripsTaken,     setTripsTaken]     = useState(0);
  const [editVisible,    setEditVisible]    = useState(false);
  const [draftName,      setDraftName]      = useState('');
  const [savingName,     setSavingName]     = useState(false);
  const [savingAvatar,   setSavingAvatar]   = useState(false);

  useEffect(() => {
    async function loadProfile() {
      // Restore cached name and avatar immediately so there's no flash
      const cachedName   = await AsyncStorage.getItem(NAME_CACHE_KEY);
      if (cachedName)   setUserName(cachedName);
      const cachedAvatar = await AsyncStorage.getItem(AVATAR_CACHE_KEY);
      if (cachedAvatar) setAvatarUri(cachedAvatar);

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';

      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;

        if (userId) {
          setUserEmail(session?.user.email ?? '');

          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', userId)
            .single();

          if (profile?.name) {
            setUserName(profile.name);
            void AsyncStorage.setItem(NAME_CACHE_KEY, profile.name);
          }
          if (profile?.avatar_url) {
            setAvatarUri(profile.avatar_url);
            void AsyncStorage.setItem(AVATAR_CACHE_KEY, profile.avatar_url);
          }

          const { count } = await supabase
            .from('trip_members')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) { setTripsTaken(count); return; }
        }
      }

      const localTrips = await loadTrips();
      setTripsTaken(localTrips.length);
    }

    void loadProfile();
  }, []);

  // ── Change avatar ────────────────────────────────────────────

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    const uri = result.assets[0].uri;
    setSavingAvatar(true);
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';

      let finalUrl = uri;

      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (userId) {
          const response = await fetch(uri);
          const blob = await response.blob();
          const path = `${userId}/avatar.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
            finalUrl = publicUrl;
            await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
          }
        }
      }

      setAvatarUri(finalUrl);
      void AsyncStorage.setItem(AVATAR_CACHE_KEY, finalUrl);
    } catch {
      Alert.alert('Error', 'Could not update avatar.');
    } finally {
      setSavingAvatar(false);
    }
  };

  // ── Edit name ────────────────────────────────────────────────

  const openEditName = () => {
    setDraftName(userName);
    setEditVisible(true);
  };

  const handleSaveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (userId) {
          await supabase.from('profiles').update({ name: trimmed }).eq('id', userId);
        }
      }
      setUserName(trimmed);
      void AsyncStorage.setItem(NAME_CACHE_KEY, trimmed);
      setEditVisible(false);
    } catch {
      Alert.alert('Error', 'Could not save name.');
    } finally {
      setSavingName(false);
    }
  };

  const handleAccountSettings = () => {
    const email = userEmail || 'Not signed in';
    Alert.alert(
      'Account Settings',
      `Signed in as:\n${email}`,
      [
        {
          text: 'Send password reset',
          onPress: async () => {
            if (!userEmail) return;
            const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Email sent', `A password reset link was sent to ${userEmail}.`);
            }
          },
        },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  const handleGetHelp = () => {
    Alert.alert(
      'Get Help',
      'Have a question or found a bug?\n\nEmail us at support@onthego.app or visit our help centre.',
      [
        {
          text: 'Open help centre',
          onPress: () => void Linking.openURL('https://onthego.app/help'),
        },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy',
      'On the GO! stores your trip data and profile information to power your experience. We never sell your data to third parties.\n\nRead our full privacy policy at onthego.app/privacy.',
      [
        {
          text: 'Read policy',
          onPress: () => void Linking.openURL('https://onthego.app/privacy'),
        },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  const SETTINGS_ITEMS: SettingsItem[] = [
    {
      key: 'account',
      icon: 'settings-outline',
      label: 'Account settings',
      hasChevron: true,
      onPress: handleAccountSettings,
    },
    {
      key: 'help',
      icon: 'help-circle-outline',
      label: 'Get help',
      hasChevron: true,
      onPress: handleGetHelp,
    },
    {
      key: 'view-profile',
      icon: 'person-outline',
      label: 'View profile',
      hasChevron: true,
      onPress: openEditName,
    },
    {
      key: 'privacy',
      icon: 'lock-closed-outline',
      label: 'Privacy',
      hasChevron: true,
      onPress: handlePrivacy,
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
          {/* Tappable avatar */}
          <TouchableOpacity
            style={styles.userAvatarCircle}
            onPress={handleChangeAvatar}
            activeOpacity={0.8}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Ionicons name="person" size={width * 0.14} color={Colors.white} />
            )}
            {savingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={Colors.white} />
              </View>
            ) : (
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={12} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>

          {/* Name + edit pencil */}
          <TouchableOpacity style={styles.nameRow} onPress={openEditName} activeOpacity={0.7}>
            <Text style={styles.userName}>{userName || '—'}</Text>
            <Ionicons name="pencil" size={16} color={Colors.lightGray} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.statsDivider} />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tripsTaken}</Text>
              <Text style={styles.statLabel}>trips taken</Text>
            </View>
            <View style={styles.statsVerticalDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tripsTaken * HOURS_PER_TRIP}</Text>
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

      {/* ── Edit name modal ── */}
      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setEditVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit name</Text>
            <TextInput
              style={styles.modalInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor={Colors.lightGray}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveName} disabled={savingName}>
                {savingName
                  ? <ActivityIndicator color={Colors.white} size="small" />
                  : <Text style={styles.modalSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  userName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.darkNavy,
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

  // ── Edit name modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: width * 0.06,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalTitle: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.045,
    color: Colors.darkNavy,
    marginBottom: height * 0.02,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#c8d8f0',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: height * 0.016,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.04,
    color: Colors.darkNavy,
    marginBottom: height * 0.022,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: height * 0.016,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#c8d8f0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: Colors.lightGray,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: height * 0.016,
    borderRadius: Radius.md,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.036,
    color: Colors.white,
  },
});
