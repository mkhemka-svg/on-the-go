import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily } from '@/constants/theme';
import { TUTORIAL_KEY, VOTING_BG_IMAGE } from '@/constants/votingConfig';

const { width, height } = Dimensions.get('window');

// ── Main Screen ───────────────────────────────────────────────

export default function VotingTutorial2Page() {
  const router = useRouter();

  const handleBack = () => router.back();   // → VotingTutorial1Page

  const handleAdvance = async () => {
    // Mark both tutorials as seen — never shown again
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
    router.replace('/vote');                // → VoteOnActivityPage
  };

  return (
    <View style={styles.root}>
      {/* ── Full-screen background (same image as Tutorial 1) ── */}
      <Image
        source={{ uri: VOTING_BG_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={0}
      />

      {/* ── Dark dim overlay ── */}
      <View style={styles.dimOverlay} />

      {/* ── Interactive layer ── */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Pressable style={styles.pressable} onPress={handleAdvance}>

          {/* Back button — handles its own touch, won't bubble */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {/* Center content — pointerEvents:'none' so touches reach the Pressable */}
          <View style={styles.centerContent}>

            {/* Activity name pill */}
            <View style={styles.activityNameCard}>
              <Text style={styles.activityName}>F1 Arcade</Text>
            </View>

            <View style={styles.dividerSpacer} />

            {/* Swipe-up instruction */}
            <View style={styles.swipeUpBlock}>
              {/* Label above the arrows */}
              <Text style={styles.swipeLabel}>Up to skip</Text>

              {/* Three stacked arrows — top is brightest (destination of swipe) */}
              <View style={styles.upArrowStack}>
                <Ionicons name="arrow-up" size={width * 0.13} color="rgba(255,255,255,0.95)" />
                <Ionicons name="arrow-up" size={width * 0.13} color="rgba(255,255,255,0.5)"  />
                <Ionicons name="arrow-up" size={width * 0.13} color="rgba(255,255,255,0.18)" />
              </View>
            </View>
          </View>

          {/* Bottom hint — different copy so user knows this is the last step */}
          <View style={styles.tapHintRow}>
            <Text style={styles.tapHint}>Tap to start voting</Text>
            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.65)" style={{ marginLeft: 4 }} />
          </View>

        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    pointerEvents: 'none',
  },

  // ── Layout ──
  safeArea: { flex: 1 },
  pressable: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // ── Back button ──
  backButton: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  // ── Center content ──
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    pointerEvents: 'none',
  },
  activityNameCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.014,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  activityName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dividerSpacer: { height: height * 0.07 },

  // ── Swipe-up instruction ──
  swipeUpBlock: {
    alignItems: 'center',
    gap: height * 0.022,
  },
  swipeLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.05,
    color: Colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  upArrowStack: {
    alignItems: 'center',
  },

  // ── Bottom hint ──
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.035,
    pointerEvents: 'none',
  },
  tapHint: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.032,
    color: 'rgba(255,255,255,0.65)',
  },
});
