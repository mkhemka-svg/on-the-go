import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function PastTripsPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.center}>
        <Ionicons name="time" size={width * 0.18} color={Colors.yellow} />
        <Text style={styles.title}>Memory Lane</Text>
        <Text style={styles.subtitle}>Past trips coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.signInBlue },
  backBtn: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: height * 0.015,
  },
  title: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.065,
    color: Colors.white,
  },
  subtitle: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: 'rgba(255,255,255,0.65)',
  },
});
