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
import { Colors, FontFamily, Radius } from '@/constants/theme';
import TripCreationStepper from '@/components/TripCreationStepper';
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

export default function InviteCollaboratorsPage() {
  const router = useRouter();

  const [tripCode, setTripCode]           = useState('');
  const [emailInput, setEmailInput]       = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL_COLLABORATORS);

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
          <Text style={styles.heading}>Invite your Crew</Text>

          <TripCodeCard
            tripCode={tripCode}
            onCopy={handleCopy}
            copied={copied}
            copiedOpacity={copiedOpacity}
          />

          <EmailInviteSection
            emailInput={emailInput}
            onChangeText={setEmailInput}
            onAdd={handleAddEmail}
          />

          <CollaboratorsRow collaborators={collaborators} />

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
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.04,
  },
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.062,
    color: Colors.white,
    marginBottom: height * 0.025,
  },
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
