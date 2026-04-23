import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import FloppyDiskIllustration from '@/components/illustrations/FloppyDiskIllustration';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const AVATAR_CACHE_KEY = 'profile_avatar_uri';
const NAME_CACHE_KEY   = 'profile_name';

const { width, height } = Dimensions.get('window');

export default function ChooseNewOrSavedTripPage() {
  const router = useRouter();

  const [userName,     setUserName]     = useState('');
  const [avatarUri,    setAvatarUri]    = useState<string | null>(null);
  const [editVisible,  setEditVisible]  = useState(false);
  const [draftName,    setDraftName]    = useState('');
  const [savingName,   setSavingName]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Reload profile data every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const cachedName   = await AsyncStorage.getItem(NAME_CACHE_KEY);
        if (cachedName)   setUserName(cachedName);
        const cachedAvatar = await AsyncStorage.getItem(AVATAR_CACHE_KEY);
        if (cachedAvatar) setAvatarUri(cachedAvatar);

        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const isConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';
        if (!isConfigured) return;

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user.id;
        if (!userId) return;

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
      }
      void loadProfile();
    }, []),
  );

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
      const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL;
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
      const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL;
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* ── Logo ── */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>On the </Text>
        <Text style={styles.logoAccent}>GO!</Text>
      </View>

      {/* ── User Profile Card ── */}
      <View style={styles.profileCard}>
        {/* Avatar — tappable to change */}
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={handleChangeAvatar}
          activeOpacity={0.8}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={width * 0.08} color={Colors.white} />
          )}
          {savingAvatar ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={Colors.white} size="small" />
            </View>
          ) : (
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={9} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.profileTextContainer}>
          <Text style={styles.welcomeLabel}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{userName || '—'} 👋</Text>
        </View>

        {/* Pencil — edit name */}
        <TouchableOpacity onPress={openEditName} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="pencil" size={18} color={Colors.lightGray} />
        </TouchableOpacity>
      </View>

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
  avatarCircle: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.07,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.lightYellow,
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
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
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
