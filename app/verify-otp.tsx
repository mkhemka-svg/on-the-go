import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const CODE_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email ?? '',
        token: code,
        type: 'email',
      });
      if (error) throw error;
      router.replace('/choose-trip');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      Alert.alert('Verification failed', message);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email ?? '',
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      Alert.alert('Code sent', 'A new code has been sent to your email.');
      // 30-second cooldown
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not resend code.';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Back button ── */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* ── Header ── */}
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.description}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* ── OTP input boxes ── */}
          <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.codeBox,
                  code.length === i && styles.codeBoxActive,
                  code.length > i && styles.codeBoxFilled,
                ]}
              >
                <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
              </View>
            ))}
          </Pressable>

          {/* Hidden input that captures keystrokes */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={text => setCode(text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
          />

          {/* ── Verify button ── */}
          <TouchableOpacity
            style={[styles.verifyButton, code.length < CODE_LENGTH && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={code.length < CODE_LENGTH || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          {/* ── Resend ── */}
          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResend}
            disabled={resendCooldown > 0}
          >
            <Text style={styles.resendText}>
              Didn't receive a code?{' '}
              <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendDisabled]}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
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
  backButton: {
    padding: 16,
    paddingTop: height * 0.02,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.04,
  },
  title: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.07,
    color: Colors.white,
    marginBottom: 12,
  },
  description: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.04,
    color: Colors.white,
    opacity: 0.85,
    lineHeight: width * 0.06,
    marginBottom: height * 0.055,
  },
  emailHighlight: {
    fontFamily: FontFamily.merriweatherBold,
    opacity: 1,
  },

  // ── OTP boxes ──
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.045,
  },
  codeBox: {
    width: (width * 0.86 - 5 * 10) / 6,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  codeBoxFilled: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: Colors.white,
  },
  codeDigit: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.white,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },

  // ── Verify button ──
  verifyButton: {
    backgroundColor: Colors.black,
    borderRadius: Radius.md,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    marginBottom: height * 0.025,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: '#444444',
  },
  verifyButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.white,
  },

  // ── Resend ──
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: Colors.white,
    opacity: 0.8,
  },
  resendLink: {
    textDecorationLine: 'underline',
    fontFamily: FontFamily.merriweatherBold,
    opacity: 1,
  },
  resendDisabled: {
    opacity: 0.5,
    textDecorationLine: 'none',
  },
});
