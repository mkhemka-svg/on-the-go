import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontFamily } from '@/constants/theme';
import AirplaneWindowIllustration from '@/components/illustrations/AirplaneWindowIllustration';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // Show the splash for a minimum of 1.5s, then resolve the session.
    // onAuthStateChange fires immediately with the persisted session (or null).
    let resolved = false;
    let timerDone = false;
    let destination: '/choose-trip' | '/sign-in' = '/sign-in';

    const navigate = () => {
      router.replace(destination);
    };

    // Minimum splash duration
    const timer = setTimeout(() => {
      timerDone = true;
      if (resolved) navigate();
    }, 1500);

    // Check persisted session — fires synchronously on first call if session is cached
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      destination = session ? '/choose-trip' : '/sign-in';
      resolved = true;
      if (timerDone) navigate();
      // Unsubscribe after first event — we only need the initial state
      subscription.unsubscribe();
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Logo text ── */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>On the </Text>
        <Text style={styles.logoAccent}>GO!</Text>
      </View>

      {/* ── Airplane window illustration (centerpiece) ── */}
      <View style={styles.illustrationContainer}>
        <AirplaneWindowIllustration />
      </View>

      {/* ── Tagline ── */}
      <Text style={styles.tagline}>Group travel, made easy.</Text>

      {/* ── Loading indicator ── */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBlue,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.04,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: height * 0.02,
  },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.12,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.12,
    color: Colors.yellow,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagline: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.white,
    opacity: 0.88,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  loaderContainer: {
    marginBottom: height * 0.02,
  },
});
