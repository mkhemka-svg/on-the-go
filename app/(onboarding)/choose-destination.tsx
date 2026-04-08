import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import TripCreationStepper from '@/components/TripCreationStepper';
import { commitDraftAsTrip } from '@/constants/tripStore';

const { width, height } = Dimensions.get('window');

const CARD_GAP    = 12;
const H_PADDING   = width * 0.06;
const CARD_WIDTH  = (width - H_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 0.85;

// ── Hardcoded trending destinations ─────────────────────────
// Supabase will supply these from the destinations table later

interface Destination {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
}

const TRENDING: Destination[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Cancún',
    country: 'Mexico',
    imageUrl: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Bali',
    country: 'Indonesia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'New York',
    country: 'USA',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop',
  },
  {
    id: '6',
    name: 'Barcelona',
    country: 'Spain',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&auto=format&fit=crop',
  },
  {
    id: '7',
    name: 'London',
    country: 'UK',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop',
  },
  {
    id: '8',
    name: 'Santorini',
    country: 'Greece',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop',
  },
  {
    id: '9',
    name: 'Rome',
    country: 'Italy',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop',
  },
  {
    id: '10',
    name: 'Amsterdam',
    country: 'Netherlands',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&auto=format&fit=crop',
  },
];

// ── Trending Destination Card ────────────────────────────────

interface CardProps {
  destination: Destination;
  isSelected: boolean;
  onSelect: (dest: Destination) => void;
}

function TrendingDestinationCard({ destination, isSelected, onSelect }: CardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect(destination)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: destination.imageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={300}
      />

      {/* Gradient-like overlay for text legibility */}
      <View style={styles.cardOverlay} />

      {/* Destination name */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{destination.name}</Text>
        <Text style={styles.cardCountry}>{destination.country}</Text>
      </View>

      {/* Selected checkmark */}
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function ChooseDestinationPage() {
  const router = useRouter();

  const [customInput, setCustomInput]           = useState('');
  const [selectedId,  setSelectedId]            = useState<string | null>(null);
  const [selectedName, setSelectedName]         = useState('');
  const [destinationError, setDestinationError] = useState('');

  const handleSelectTrending = (dest: Destination) => {
    setSelectedId(dest.id);
    setSelectedName(`${dest.name}, ${dest.country}`);
    setCustomInput('');
    setDestinationError('');
  };

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    setSelectedId('custom');
    setSelectedName(name);
    setDestinationError('');
  };

  const handleNext = async () => {
    if (!selectedName) {
      setDestinationError('Please select or enter a destination.');
      return;
    }
    await commitDraftAsTrip(selectedName);
    router.replace('/saved-trips');
  };

  // Build grid rows (pairs of 2)
  const rows: Destination[][] = [];
  for (let i = 0; i < TRENDING.length; i += 2) {
    rows.push(TRENDING.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

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
          onPress={handleNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Stepper — step 3 active ── */}
      <TripCreationStepper activeStep={3} />

      {/* ── Scrollable content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Where to heading */}
        <Text style={styles.heading}>Where to?</Text>

        {/* Selected destination pill */}
        {!!selectedName && (
          <View style={styles.selectedPill}>
            <Ionicons name="location" size={16} color={Colors.darkNavy} />
            <Text style={styles.selectedText} numberOfLines={1}>{selectedName}</Text>
            <TouchableOpacity onPress={() => { setSelectedId(null); setSelectedName(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.darkNavy} />
            </TouchableOpacity>
          </View>
        )}

        {/* Custom destination input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add custom destination"
            placeholderTextColor={Colors.lightGray}
            value={customInput}
            onChangeText={text => { setCustomInput(text); setDestinationError(''); }}
            returnKeyType="done"
            onSubmitEditing={handleAddCustom}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustom}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={26} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Error */}
        {!!destinationError && (
          <Text style={styles.errorText}>{destinationError}</Text>
        )}

        {/* Trending label */}
        <Text style={styles.sectionLabel}>Top 10 Trending...</Text>

        {/* Destination grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map(dest => (
                <TrendingDestinationCard
                  key={dest.id}
                  destination={dest}
                  isSelected={selectedId === dest.id}
                  onSelect={handleSelectTrending}
                />
              ))}
              {/* Fill empty slot if odd number */}
              {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
            </View>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Finish & Save Trip</Text>
          <Ionicons name="checkmark-circle" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: H_PADDING,
    paddingBottom: height * 0.04,
  },

  // ── Heading ──
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.07,
    color: Colors.white,
    marginBottom: height * 0.02,
  },

  // ── Selected pill ──
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: height * 0.016,
    maxWidth: '90%',
  },
  selectedText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.036,
    color: Colors.darkNavy,
    flex: 1,
  },

  // ── Input row ──
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  input: {
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
  errorText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.033,
    color: '#ffcccc',
    marginBottom: 8,
  },

  // ── Section label ──
  sectionLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.white,
    marginTop: height * 0.022,
    marginBottom: height * 0.016,
  },

  // ── Grid ──
  grid: {
    gap: CARD_GAP,
    marginBottom: height * 0.032,
  },
  gridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },

  // ── Destination card ──
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.yellow,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  cardName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.038,
    color: Colors.white,
  },
  cardCountry: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.028,
    color: 'rgba(255,255,255,0.8)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
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
