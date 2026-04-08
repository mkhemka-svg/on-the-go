import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';

const { width } = Dimensions.get('window');

export type TabName = 'trips' | 'itinerary' | 'voting' | 'calendar' | 'invite';

interface TabConfig {
  name: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const TABS: TabConfig[] = [
  {
    name: 'trips',
    label: 'Trips',
    icon: 'airplane-outline',
    iconActive: 'airplane',
    route: '/saved-trips',
  },
  {
    name: 'itinerary',
    label: 'Itinerary',
    icon: 'list-outline',
    iconActive: 'list',
    route: '/itinerary',
  },
  {
    name: 'voting',
    label: 'Voting',
    icon: 'thumbs-up-outline',
    iconActive: 'thumbs-up',
    route: '/vote',
  },
  {
    name: 'calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    route: '/calendar',
  },
  {
    name: 'invite',
    label: 'Invite',
    icon: 'person-add-outline',
    iconActive: 'person-add',
    route: '/invite',
  },
];

interface Props {
  activeTab?: TabName;
}

export default function BottomNavigationBar({ activeTab }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {TABS.map(tab => {
        const isActive = tab.name === activeTab;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.replace(tab.route as any)}
            activeOpacity={0.7}
          >
            {/* Active underline indicator */}
            {isActive && <View style={styles.activeIndicator} />}

            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={width * 0.058}
              color={isActive ? Colors.yellow : Colors.white}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.darkNavy,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: '60%',
    height: 3,
    backgroundColor: Colors.yellow,
    borderRadius: 2,
  },
  label: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.026,
    color: Colors.white,
    opacity: 0.7,
  },
  labelActive: {
    fontFamily: FontFamily.merriweatherBold,
    color: Colors.yellow,
    opacity: 1,
  },
});
