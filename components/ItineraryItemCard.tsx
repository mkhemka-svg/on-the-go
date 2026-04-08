import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export interface ItineraryItem {
  id: string;
  title: string;
  description: string;
  scheduledDate: string;  // e.g. "4/15"
  scheduledTime: string;  // e.g. "1:00 pm"
}

interface Props {
  item: ItineraryItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export default function ItineraryItemCard({ item, isExpanded, onToggle }: Props) {
  const rotation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  // Sync chevron animation whenever parent changes isExpanded
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const chevronRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.8}
    >
      {/* ── Collapsed row: title + chevron ── */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.dotIndicator} />
          <Text style={styles.title} numberOfLines={isExpanded ? undefined : 1}>
            {item.title}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <Ionicons name="chevron-down" size={18} color={Colors.darkNavy} />
        </Animated.View>
      </View>

      {/* ── Expanded: description + scheduled ── */}
      {isExpanded && (
        <>
          <View style={styles.divider} />
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.scheduledRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.darkNavy} />
            <Text style={styles.scheduledText}>
              Planned for {item.scheduledDate} at {item.scheduledTime}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: width * 0.045,
    paddingVertical: width * 0.04,
    marginBottom: width * 0.03,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
    marginRight: 10,
    flexShrink: 0,
  },
  title: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.038,
    color: Colors.darkNavy,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8eef8',
    marginVertical: width * 0.03,
  },
  description: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: '#555',
    lineHeight: width * 0.052,
    marginBottom: width * 0.025,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduledText: {
    fontFamily: FontFamily.merriweatherItalic,
    fontSize: width * 0.031,
    color: Colors.darkNavy,
  },
});
