import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

// Placeholder — will be replaced when YourSavedTripsPage is built
export default function SavedTripsPage() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.text}>Your Saved Trips — coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryBlue },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.white, fontSize: 18 },
});
