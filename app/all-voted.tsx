import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function AllActivitiesVotedPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.content}>

        {/* ── Checkmark circle ── */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={width * 0.16} color={Colors.white} />
        </View>

        <Text style={styles.heading}>All done!</Text>
        <Text style={styles.subheading}>
          You've voted on every activity.{'\n'}Your crew's results are tallied.
        </Text>

        {/* ── Go to itinerary hint ── */}
        <TouchableOpacity
          style={styles.itineraryBtn}
          onPress={() => router.replace('/itinerary')}
          activeOpacity={0.8}
        >
          <Text style={styles.itineraryBtnText}>Go to Itinerary</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.darkNavy} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* ── Arrow pointing toward itinerary tab hint ── */}
        <View style={styles.tabHintRow}>
          <Text style={styles.tabHint}>Or tap the itinerary tab below</Text>
          <Ionicons name="arrow-down" size={14} color="rgba(29,90,188,0.5)" style={{ marginLeft: 6 }} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.1,
  },

  // ── Icon ──
  iconCircle: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.04,
  },

  // ── Text ──
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.072,
    color: Colors.darkNavy,
    textAlign: 'center',
    marginBottom: height * 0.016,
  },
  subheading: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: width * 0.058,
    marginBottom: height * 0.056,
  },

  // ── Button ──
  itineraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightYellow,
    borderRadius: Radius.full,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.018,
    marginBottom: height * 0.028,
  },
  itineraryBtnText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.darkNavy,
  },

  // ── Tab hint ──
  tabHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabHint: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.03,
    color: 'rgba(29,90,188,0.5)',
  },
});
