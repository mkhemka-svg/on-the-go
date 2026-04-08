import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontFamily } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate app initialization (auth check, data prefetch, etc.)
    // Replace with real auth/session check when Supabase is wired up
    const timer = setTimeout(() => {
      router.replace('/sign-in');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>On the</Text>
          <Text style={styles.logoTextAccent}>GO!</Text>
        </View>
        <Text style={styles.tagline}>Group travel, made easy.</Text>
      </View>

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginBottom: height * 0.018,
  },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.16,
    color: Colors.white,
    lineHeight: width * 0.19,
  },
  logoTextAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.16,
    color: Colors.yellow,
    lineHeight: width * 0.19,
  },
  tagline: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.042,
    color: Colors.white,
    opacity: 0.85,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  loaderContainer: {
    paddingBottom: height * 0.06,
  },
});
