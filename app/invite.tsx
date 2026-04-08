import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import {
  Collaborator,
  AVATAR_COLORS,
  INITIAL_COLLABORATORS,
  generateTripCode,
  isValidEmail,
  TripCodeCard,
  EmailInviteSection,
  CollaboratorsRow,
  useCopyCode,
} from '@/components/InviteShared';

const { width, height } = Dimensions.get('window');

// ── Main Screen ───────────────────────────────────────────────

export default function InviteMoreCrewPage() {
  const router = useRouter();

  const [tripCode, setTripCode]           = useState('');
  const [emailInput, setEmailInput]       = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);

  // Reuse the same trip code generated during trip creation
  // (hardcoded generate here — will be fetched from Supabase later)
  useEffect(() => { setTripCode(generateTripCode()); }, []);

  const { copied, copiedOpacity, handleCopy } = useCopyCode(tripCode);

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (collaborators.some(c => c.email === email)) {
      Alert.alert('Already added', 'This person has already been invited.');
      return;
    }
    const name  = email.split('@')[0];
    const color = AVATAR_COLORS[collaborators.length % AVATAR_COLORS.length];
    setCollaborators(prev => [...prev, { id: String(Date.now()), name, email, color }]);
    setEmailInput('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>On the </Text>
            <Text style={styles.logoAccent}>GO!</Text>
          </View>

          {/* Profile avatar icon */}
          <TouchableOpacity
            style={styles.avatarBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Heading ── */}
        <Text style={styles.heading}>Invite More of Your Crew!</Text>

        {/* ── Scrollable content ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Code Card — reused from InviteShared */}
          <TripCodeCard
            tripCode={tripCode}
            onCopy={handleCopy}
            copied={copied}
            copiedOpacity={copiedOpacity}
          />

          {/* Email Invite — reused from InviteShared */}
          <EmailInviteSection
            emailInput={emailInput}
            onChangeText={setEmailInput}
            onAdd={handleAddEmail}
          />

          {/* Collaborators Row — reused from InviteShared */}
          <CollaboratorsRow collaborators={collaborators} />

          {/* Bottom spacing above nav bar */}
          <View style={{ height: height * 0.02 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Navigation Bar — Invite tab active ── */}
      <BottomNavigationBar activeTab="invite" />
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

  // ── Profile avatar ──
  avatarBtn: {
    width: 40,
    alignItems: 'center',
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

  // ── Heading ──
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.058,
    color: Colors.white,
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.025,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.02,
  },
});
