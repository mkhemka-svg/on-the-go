import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import TripCreationStepper from '@/components/TripCreationStepper';

const { width, height } = Dimensions.get('window');

// ── Helpers ──────────────────────────────────────────────────

function generateTripCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── Types ─────────────────────────────────────────────────────

interface Collaborator {
  id: string;
  name: string;
  email: string;
  color: string;
}

const AVATAR_COLORS = [
  Colors.darkNavy,
  '#9B59B6',
  '#E67E22',
  '#27AE60',
  '#E74C3C',
  '#2980B9',
];

// ── Hardcoded placeholders — replace with Supabase data ──────
const INITIAL_COLLABORATORS: Collaborator[] = [
  { id: '1', name: 'Sarah K.',  email: 'sarah@email.com',  color: AVATAR_COLORS[0] },
  { id: '2', name: 'Jake M.',   email: 'jake@email.com',   color: AVATAR_COLORS[1] },
  { id: '3', name: 'Priya R.',  email: 'priya@email.com',  color: AVATAR_COLORS[2] },
];

// ── CollaboratorCard ─────────────────────────────────────────

function CollaboratorCard({ collaborator }: { collaborator: Collaborator }) {
  const initials = collaborator.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={cardStyles.container}>
      <View style={[cardStyles.avatar, { backgroundColor: collaborator.color }]}>
        <Text style={cardStyles.initials}>{initials}</Text>
      </View>
      <Text style={cardStyles.name} numberOfLines={1}>{collaborator.name}</Text>
    </View>
  );
}

const AVATAR_SIZE = width * 0.14;

const cardStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: AVATAR_SIZE + 8,
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: Colors.lightYellow,
  },
  initials: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.white,
  },
  name: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.03,
    color: Colors.white,
    textAlign: 'center',
  },
});

// ── Main Screen ───────────────────────────────────────────────

export default function InviteCollaboratorsPage() {
  const router = useRouter();

  const [tripCode, setTripCode]             = useState('');
  const [emailInput, setEmailInput]         = useState('');
  const [collaborators, setCollaborators]   = useState<Collaborator[]>(INITIAL_COLLABORATORS);
  const [copied, setCopied]                 = useState(false);
  const copiedOpacity                       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTripCode(generateTripCode());
  }, []);

  // ── Copy trip code ────────────────────────────────────────
  const handleCopy = async () => {
    await Clipboard.setStringAsync(tripCode);
    setCopied(true);
    Animated.sequence([
      Animated.timing(copiedOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(copiedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setCopied(false));
  };

  // ── Add email collaborator ────────────────────────────────
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

    const name = email.split('@')[0];
    const color = AVATAR_COLORS[collaborators.length % AVATAR_COLORS.length];
    setCollaborators(prev => [
      ...prev,
      { id: String(Date.now()), name, email, color },
    ]);
    setEmailInput('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

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
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push('/(onboarding)/choose-destination')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-forward" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── Stepper — step 2 active ── */}
        <TripCreationStepper activeStep={2} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Heading ── */}
          <Text style={styles.heading}>Invite your Crew</Text>

          {/* ── Trip Code Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Code</Text>
            <Text style={styles.cardSubtitle}>Share this code with your crew!</Text>

            <View style={styles.codeRow}>
              <View style={styles.codeField}>
                <Text style={styles.codeText}>{tripCode}</Text>
              </View>

              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={18}
                  color={Colors.white}
                />
                <Text style={styles.copyLabel}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            {/* Copied confirmation */}
            <Animated.Text style={[styles.copiedText, { opacity: copiedOpacity }]}>
              Code copied to clipboard!
            </Animated.Text>
          </View>

          {/* ── Invite by email ── */}
          <Text style={styles.sectionLabel}>Invite by Email</Text>
          <View style={styles.emailRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="crew@email.com"
              placeholderTextColor={Colors.lightGray}
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleAddEmail}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddEmail}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={26} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* ── Collaborators row ── */}
          {collaborators.length > 0 && (
            <View style={styles.collaboratorsSection}>
              <Text style={styles.collaboratorsLabel}>
                {collaborators.length} {collaborators.length === 1 ? 'member' : 'members'} added
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.collaboratorsRow}
              >
                {collaborators.map(c => (
                  <CollaboratorCard key={c.id} collaborator={c} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Next button ── */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push('/(onboarding)/choose-destination')}
            activeOpacity={0.85}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: height * 0.028,
  },
  navBtn: { width: 40, alignItems: 'center' },
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

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.04,
  },

  // ── Heading ──
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.062,
    color: Colors.white,
    marginBottom: height * 0.025,
  },

  // ── Trip Code Card ──
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: width * 0.05,
    marginBottom: height * 0.028,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTitle: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.045,
    color: Colors.darkNavy,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: Colors.lightGray,
    marginBottom: height * 0.02,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeField: {
    flex: 1,
    backgroundColor: Colors.lightYellow,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.yellow,
    alignItems: 'center',
  },
  codeText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.darkNavy,
    letterSpacing: 6,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  copyLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.034,
    color: Colors.white,
  },
  copiedText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.032,
    color: Colors.darkNavy,
    textAlign: 'center',
    marginTop: 8,
  },

  // ── Email invite ──
  sectionLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.white,
    marginBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: height * 0.028,
  },
  emailInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: height * 0.018,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.black,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  // ── Collaborators ──
  collaboratorsSection: {
    marginBottom: height * 0.028,
  },
  collaboratorsLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 12,
  },
  collaboratorsRow: {
    paddingRight: 8,
  },

  // ── Next button ──
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.white,
  },
});
