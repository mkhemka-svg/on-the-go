import { useEffect } from 'react';
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

// ── Vertical dashed line ──────────────────────────────────────

function VerticalDashedLine() {
  const DASH_H = 12;
  const GAP_H  = 8;
  const count  = Math.ceil(height / (DASH_H + GAP_H));

  return (
    // pointerEvents in style — required in RN 0.76+ New Architecture
    <View style={styles.dashedLineWrapper}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={i < count - 1 ? [styles.dash, { marginBottom: GAP_H }] : styles.dash}
        />
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function VotingTutorial1Page() {
  const router = useRouter();

  // Skip both tutorials if already seen
  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then(value => {
      if (value === 'true') {
        router.replace('/vote');
      }
    });
  }, []);

  const handleBack    = () => router.back();
  const handleAdvance = () => router.push('/vote-tutorial-2');

  return (
    <View style={styles.root}>
      {/* ── Full-screen background image ── */}
      <Image
        source={{ uri: VOTING_BG_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={0}
      />

      {/* ── Dark dim overlay — pointerEvents in style ── */}
      <View style={styles.dimOverlay} />

      {/* ── Vertical dashed divider ── */}
      <VerticalDashedLine />

      {/* ── Interactive layer ── */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Pressable style={styles.pressable} onPress={handleAdvance}>

          {/* Back button handles its own touch — won't bubble to Pressable */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>

          {/* Center content — pointerEvents:'none' in style so touches pass to Pressable */}
          <View style={styles.centerContent}>

            {/* Activity name */}
            <View style={styles.activityNameCard}>
              <Text style={styles.activityName}>F1 Arcade</Text>
            </View>

            <View style={styles.dividerSpacer} />

            {/* Left / Right panels */}
            <View style={styles.panelsRow}>

              {/* LEFT — dislike */}
              <View style={styles.panel}>
                <Ionicons name="close-circle"    size={width * 0.18} color={Colors.red} />
                <View style={styles.arrowRow}>
                  <Ionicons name="arrow-back" size={width * 0.08} color="rgba(255,255,255,0.9)" />
                  <Ionicons name="arrow-back" size={width * 0.08} color="rgba(255,255,255,0.45)" />
                </View>
                <Text style={styles.swipeLabel}>Left to dislike</Text>
              </View>

              {/* Gap where the dashed line sits */}
              <View style={{ width: width * 0.08 }} />

              {/* RIGHT — like */}
              <View style={styles.panel}>
                <Ionicons name="checkmark-circle" size={width * 0.18} color={Colors.green} />
                <View style={styles.arrowRow}>
                  <Ionicons name="arrow-forward" size={width * 0.08} color="rgba(255,255,255,0.45)" />
                  <Ionicons name="arrow-forward" size={width * 0.08} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.swipeLabel}>Right to like</Text>
              </View>
            </View>
          </View>

          {/* Bottom hint */}
          <View style={styles.tapHintRow}>
            <Text style={styles.tapHint}>Tap anywhere to continue</Text>
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
    pointerEvents: 'none',      // ← style prop, not View prop (RN 0.76+)
  },

  // ── Dashed line ──
  dashedLineWrapper: {
    position: 'absolute',
    left: width / 2 - 1,
    top: 0,
    width: 2,
    height,
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',      // ← style prop
  },
  dash: {
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 1,
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
    paddingHorizontal: width * 0.04,
    pointerEvents: 'none',      // ← style prop — touches pass through to Pressable
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
  dividerSpacer: { height: height * 0.06 },

  // ── Panels ──
  panelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    pointerEvents: 'none',      // ← style prop
  },
  panel: {
    flex: 1,
    alignItems: 'center',
    gap: height * 0.018,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  swipeLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.036,
    color: Colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── Bottom hint ──
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.035,
    pointerEvents: 'none',      // ← style prop
  },
  tapHint: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.032,
    color: 'rgba(255,255,255,0.65)',
  },
});
