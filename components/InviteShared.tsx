/**
 * Shared invite components and utilities used by both:
 *  - InviteCollaboratorsStepTwoPage  (onboarding flow)
 *  - InviteMoreCrewPage              (post-onboarding, Invite tab)
 */
import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────

export const AVATAR_COLORS = [
  Colors.darkNavy,
  '#9B59B6',
  '#E67E22',
  '#27AE60',
  '#E74C3C',
  '#2980B9',
];

export const INITIAL_COLLABORATORS: Collaborator[] = [
  { id: '1', name: 'Sarah K.',  email: 'sarah@email.com',  color: AVATAR_COLORS[0] },
  { id: '2', name: 'Jake M.',   email: 'jake@email.com',   color: AVATAR_COLORS[1] },
  { id: '3', name: 'Priya R.',  email: 'priya@email.com',  color: AVATAR_COLORS[2] },
];

// ── Utilities ─────────────────────────────────────────────────

export function generateTripCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── CollaboratorCard ─────────────────────────────────────────

const AVATAR_SIZE = width * 0.14;

export function CollaboratorCard({ collaborator }: { collaborator: Collaborator }) {
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

// ── TripCodeCard ─────────────────────────────────────────────

interface TripCodeCardProps {
  tripCode: string;
  onCopy: () => void;
  copied: boolean;
  copiedOpacity: Animated.Value;
}

export function TripCodeCard({ tripCode, onCopy, copied, copiedOpacity }: TripCodeCardProps) {
  return (
    <View style={sharedStyles.card}>
      <Text style={sharedStyles.cardTitle}>Trip Code</Text>
      <Text style={sharedStyles.cardSubtitle}>Share this code with your crew!</Text>

      <View style={sharedStyles.codeRow}>
        <View style={sharedStyles.codeField}>
          <Text style={sharedStyles.codeText}>{tripCode}</Text>
        </View>
        <TouchableOpacity
          style={sharedStyles.copyButton}
          onPress={onCopy}
          activeOpacity={0.8}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={18}
            color={Colors.white}
          />
          <Text style={sharedStyles.copyLabel}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>

      <Animated.Text style={[sharedStyles.copiedText, { opacity: copiedOpacity }]}>
        Code copied to clipboard!
      </Animated.Text>
    </View>
  );
}

// ── EmailInviteSection ────────────────────────────────────────

interface EmailInviteSectionProps {
  emailInput: string;
  onChangeText: (text: string) => void;
  onAdd: () => void;
}

export function EmailInviteSection({ emailInput, onChangeText, onAdd }: EmailInviteSectionProps) {
  return (
    <>
      <Text style={sharedStyles.sectionLabel}>Invite by Email</Text>
      <View style={sharedStyles.emailRow}>
        <TextInput
          style={sharedStyles.emailInput}
          placeholder="crew@email.com"
          placeholderTextColor={Colors.lightGray}
          value={emailInput}
          onChangeText={onChangeText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onAdd}
        />
        <TouchableOpacity
          style={sharedStyles.addButton}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </>
  );
}

// ── CollaboratorsRow ──────────────────────────────────────────

interface CollaboratorsRowProps {
  collaborators: Collaborator[];
}

export function CollaboratorsRow({ collaborators }: CollaboratorsRowProps) {
  if (collaborators.length === 0) return null;
  return (
    <View style={sharedStyles.collaboratorsSection}>
      <Text style={sharedStyles.collaboratorsLabel}>
        {collaborators.length} {collaborators.length === 1 ? 'member' : 'members'} added
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={sharedStyles.collaboratorsScrollContent}
      >
        {collaborators.map(c => (
          <CollaboratorCard key={c.id} collaborator={c} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── useCopyCode hook ──────────────────────────────────────────

export function useCopyCode(tripCode: string) {
  const copiedOpacity = useRef(new Animated.Value(0)).current;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(tripCode);
    setCopied(true);
    Animated.sequence([
      Animated.timing(copiedOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(copiedOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setCopied(false));
  };

  return { copied, copiedOpacity, handleCopy };
}

// ── Shared styles ─────────────────────────────────────────────

export const sharedStyles = StyleSheet.create({
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
  collaboratorsScrollContent: {
    paddingRight: 8,
  },
});
