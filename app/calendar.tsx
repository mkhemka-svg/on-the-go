import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';

// Placeholder — will be replaced when CalendarPage is built
export default function CalendarPage() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.center}>
        <Text style={styles.text}>Calendar — coming soon</Text>
      </View>
      <BottomNavigationBar activeTab="calendar" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryBlue },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: Colors.white, fontSize: 18 },
});
