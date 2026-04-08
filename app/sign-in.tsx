import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamily, Radius } from '@/constants/theme';

// Required for OAuth redirect to close the in-app browser tab
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function SignInOrSignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  // ── Email OTP ─────────────────────────────────────────────
  const handleEmailContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      router.push({ pathname: '/verify-otp', params: { email: trimmed } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────────
  // Setup required in Supabase Dashboard:
  //   Authentication → Providers → Google → enable, add Client ID & Secret
  //   Add redirect URL: onthego://auth/callback
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectTo = makeRedirectUri({ scheme: 'onthego', path: 'auth/callback' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'success' && result.url) {
        const params = new URL(result.url).searchParams;
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          router.replace('/choose-trip');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      Alert.alert('Error', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Apple Sign In ──────────────────────────────────────────
  // Setup required in Supabase Dashboard:
  //   Authentication → Providers → Apple → enable, add Service ID, team ID, key ID & private key
  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) throw new Error('No identity token from Apple.');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;
      router.replace('/choose-trip');
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'ERR_REQUEST_CANCELED') return; // user dismissed
      const message = err instanceof Error ? err.message : 'Apple sign-in failed.';
      Alert.alert('Error', message);
    } finally {
      setAppleLoading(false);
    }
  };

  const emailIsValid = email.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>On the </Text>
            <Text style={styles.logoAccent}>GO!</Text>
          </View>

          <Text style={styles.subtitle}>Sign in or create an account</Text>

          {/* ── Email input ── */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.emailInput}
              placeholder="email@domain.com"
              placeholderTextColor={Colors.lightGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={handleEmailContinue}
            />
          </View>

          {/* ── Continue button ── */}
          <TouchableOpacity
            style={[styles.continueButton, !emailIsValid && styles.continueButtonDisabled]}
            onPress={handleEmailContinue}
            disabled={!emailIsValid || emailLoading}
            activeOpacity={0.8}
          >
            {emailLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* ── Or divider ── */}
          <View style={styles.orRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Google button ── */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.darkNavy} />
            ) : (
              <>
                <FontAwesome name="google" size={20} color="#4285F4" style={styles.socialIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Apple button (only shown when available on device) ── */}
          {appleAvailable && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={appleLoading}
              activeOpacity={0.85}
            >
              {appleLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color={Colors.white} style={styles.socialIcon} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* ── Terms ── */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
  },

  // ── Logo ──
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.1,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.1,
    color: Colors.yellow,
  },
  subtitle: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.white,
    opacity: 0.85,
    marginBottom: height * 0.045,
  },

  // ── Email input ──
  inputWrapper: {
    marginBottom: height * 0.018,
  },
  emailInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    paddingVertical: height * 0.02,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.04,
    color: Colors.black,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  // ── Continue button ──
  continueButton: {
    backgroundColor: Colors.black,
    borderRadius: Radius.md,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.03,
    minHeight: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#444444',
  },
  continueButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.white,
    letterSpacing: 0.3,
  },

  // ── Or divider ──
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.white,
    opacity: 0.45,
  },
  orText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.white,
    opacity: 0.9,
  },

  // ── Social buttons ──
  socialIcon: {
    marginRight: 10,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: height * 0.019,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
    minHeight: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  googleButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.darkNavy,
  },
  appleButton: {
    flexDirection: 'row',
    backgroundColor: Colors.black,
    borderRadius: Radius.md,
    paddingVertical: height * 0.019,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.016,
    minHeight: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  appleButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.white,
  },

  // ── Terms ──
  termsText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.032,
    color: Colors.white,
    opacity: 0.75,
    textAlign: 'center',
    lineHeight: width * 0.048,
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.04,
  },
  termsLink: {
    textDecorationLine: 'underline',
    opacity: 1,
  },
});
