import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily } from '@/constants/theme';

// Placeholder — will be replaced when VotingTutorial2Page is built
export default function VotingTutorial2Page() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.text}>VotingTutorial2Page — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: FontFamily.merriweather, color: Colors.white, fontSize: 16 },
});
