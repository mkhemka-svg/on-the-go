import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import ReanimatedLib, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { loadItems, itemToActivity, Activity } from '@/constants/itineraryStore';

const { width, height } = Dimensions.get('window');

type VoteValue = 'like' | 'dislike' | 'skip';

const SWIPE_H     = width  * 0.3;
const SWIPE_V     = height * 0.22;
const CARD_COLL_H = height * 0.19;
const CARD_EXP_H  = height * 0.5;

// ── Main Screen ───────────────────────────────────────────────

export default function VoteOnActivityPage() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  // ── Activities loaded from the shared itinerary store ────────
  const [activities, setActivities] = useState<Activity[]>([]);

  // currentIndexRef keeps latest index accessible from runOnJS callbacks
  const currentIndexRef = useRef(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isExpanded,   setIsExpanded]   = useState(false);

  // userId ref — populated once on mount, stable for the session
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load activities from the same store itinerary.tsx writes to
    loadItems().then(items => setActivities(items.map(itemToActivity)));
    // Load user id for Supabase vote writes
    supabase.auth.getSession().then(({ data }) => {
      userIdRef.current = data.session?.user.id ?? null;
    });
  }, []);

  // Reanimated shared values for swipe transform
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // React Native Animated for card height (can't use native driver for layout)
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardHeight = cardAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [CARD_COLL_H, CARD_EXP_H],
  });

  // ── Card expand / collapse ───────────────────────────────────
  const expandCard = () => {
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: false, friction: 8 }).start();
    setIsExpanded(true);
  };
  const collapseCard = () => {
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: false, friction: 8 }).start();
    setIsExpanded(false);
  };
  const toggleCard = () => (isExpanded ? collapseCard() : expandCard());

  // ── Vote handler (JS thread, called via runOnJS) ─────────────
  const handleVote = useCallback((value: VoteValue) => {
    const idx        = currentIndexRef.current;
    const activityId = activities[idx]?.id;
    const userId     = userIdRef.current;
    if (!activityId) return;

    // 1. Write to AsyncStorage immediately (local cache / offline fallback)
    void AsyncStorage.getItem('votes').then(stored => {
      const votes: Record<string, VoteValue> = stored ? JSON.parse(stored) : {};
      votes[activityId] = value;
      return AsyncStorage.setItem('votes', JSON.stringify(votes));
    });

    // 2. Sync vote to Supabase so all crew members see it in real time.
    //    Uses upsert on (itinerary_item_id, user_id) so re-voting updates
    //    the existing row rather than creating a duplicate.
    if (userId) {
      void supabase
        .from('votes')
        .upsert(
          { itinerary_item_id: activityId, user_id: userId, value },
          { onConflict: 'itinerary_item_id,user_id' },
        )
        .then(({ error }) => {
          if (error) {
            console.warn('[Vote] Supabase upsert failed:', error.message);
          }
        });
    }

    // 3. After swipe exit animation, advance to next activity
    setTimeout(() => {
      if (idx + 1 >= activities.length) {
        router.replace('/all-voted');
        return;
      }
      const next = idx + 1;
      currentIndexRef.current = next;
      setDisplayIndex(next);
      collapseCard();
      cardAnim.setValue(0);
      translateX.value = 0;
      translateY.value = 0;
    }, 320);
  }, [router, activities]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan gesture ──────────────────────────────────────────────
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(e => {
          translateX.value = e.translationX;
          translateY.value = e.translationY;
        })
        .onEnd(e => {
          if (e.translationX > SWIPE_H) {
            // Swipe right → like
            translateX.value = withTiming(width * 1.5, { duration: 280 });
            runOnJS(handleVote)('like');
          } else if (e.translationX < -SWIPE_H) {
            // Swipe left → dislike
            translateX.value = withTiming(-width * 1.5, { duration: 280 });
            runOnJS(handleVote)('dislike');
          } else if (e.translationY < -SWIPE_V) {
            // Swipe up → skip
            translateY.value = withTiming(-height * 1.5, { duration: 280 });
            runOnJS(handleVote)('skip');
          } else {
            // Below threshold — snap back
            translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
            translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
          }
        }),
    [handleVote], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Animated styles ─────────────────────────────────────────
  const swipeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${(translateX.value / width) * 12}deg` },
    ],
  }));

  // Opacity of like / dislike stamp icons
  const likeOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, translateX.value / (SWIPE_H * 0.6))),
  }));
  const dislikeOpacity = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, -translateX.value / (SWIPE_H * 0.6))),
  }));

  const activity = activities[displayIndex];

  // Don't render until activities are loaded
  if (!activity) return null;

  return (
    <View style={styles.root}>

      {/* ── Swipeable background layer ── */}
      <GestureDetector gesture={panGesture}>
        <ReanimatedLib.View style={[StyleSheet.absoluteFillObject, swipeStyle]}>
          <Image
            source={{ uri: activity.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.dimOverlay} />
        </ReanimatedLib.View>
      </GestureDetector>

      {/* ── Like stamp (green ✓) — fades in on right swipe ── */}
      <ReanimatedLib.View style={[styles.stampIcon, styles.likeStamp, likeOpacity]}>
        <Ionicons name="checkmark-circle" size={width * 0.28} color={Colors.green} />
      </ReanimatedLib.View>

      {/* ── Dislike stamp (red ✗) — fades in on left swipe ── */}
      <ReanimatedLib.View style={[styles.stampIcon, styles.dislikeStamp, dislikeOpacity]}>
        <Ionicons name="close-circle" size={width * 0.28} color={Colors.red} />
      </ReanimatedLib.View>

      {/* ── Back button (rendered above gesture layer) ── */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={() => router.replace('/itinerary')}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <View style={styles.backCircle}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </View>
      </TouchableOpacity>

      {/* ── Backdrop: tapping outside expanded card collapses it ── */}
      {isExpanded && (
        <Pressable
          style={[
            StyleSheet.absoluteFillObject,
            { bottom: CARD_COLL_H + (insets.bottom || 0) },
          ]}
          onPress={collapseCard}
        />
      )}

      {/* ── Activity info card (anchored at bottom) ── */}
      <Animated.View
        style={[
          styles.activityCard,
          { height: cardHeight, bottom: insets.bottom || 0 },
        ]}
      >
        {/* Description — only shown when expanded */}
        {isExpanded && (
          <Text style={styles.description} numberOfLines={7}>
            {activity.description}
          </Text>
        )}

        {/* Name row + Read More / Close */}
        <View style={styles.cardNameRow}>
          <Text style={styles.activityName} numberOfLines={1}>
            {activity.title}
          </Text>
          <TouchableOpacity style={styles.readMoreBtn} onPress={toggleCard} activeOpacity={0.7}>
            <Text style={styles.readMoreText}>{isExpanded ? 'Close' : 'Read More'}</Text>
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-up'}
              size={14}
              color={Colors.darkNavy}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {activities.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === displayIndex && styles.dotActive,
                i < displayIndex  && styles.dotVoted,
              ]}
            />
          ))}
        </View>
      </Animated.View>
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
    backgroundColor: 'rgba(0,0,0,0.38)',
    pointerEvents: 'none',
  },

  // ── Swipe stamp icons ──
  stampIcon: {
    position: 'absolute',
    top: height * 0.18,
    pointerEvents: 'none',
  },
  likeStamp: {
    left: width * 0.08,
    transform: [{ rotate: '-15deg' }],
  },
  dislikeStamp: {
    right: width * 0.08,
    transform: [{ rotate: '15deg' }],
  },

  // ── Back button ──
  backButton: {
    position: 'absolute',
    left: width * 0.05,
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

  // ── Activity info card ──
  activityCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.016,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    justifyContent: 'flex-end',
  },
  description: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: '#444',
    lineHeight: width * 0.056,
    marginBottom: height * 0.016,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.012,
  },
  activityName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.054,
    color: Colors.darkNavy,
    flex: 1,
    marginRight: 12,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  readMoreText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.03,
    color: Colors.darkNavy,
  },

  // ── Progress dots ──
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0d8e8',
  },
  dotActive: {
    backgroundColor: Colors.darkNavy,
    width: 18,
  },
  dotVoted: {
    backgroundColor: Colors.yellow,
  },
});
