import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export interface TripCardData {
  id: string;
  name: string;
  location: string;        // e.g. "Cancún, Mexico"
  startDate: string;       // e.g. "Mar 1"
  endDate: string;         // e.g. "Mar 7"
  coverImageUrl: string;
}

interface Props {
  trip: TripCardData;
  onPress: (id: string) => void;
}

export default function TripCard({ trip, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(trip.id)}
      activeOpacity={0.88}
    >
      {/* Cover image */}
      <Image
        source={{ uri: trip.coverImageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Info section */}
      <View style={styles.info}>
        <Text style={styles.tripName} numberOfLines={1}>{trip.name}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Colors.lightGray} />
          <Text style={styles.metaText} numberOfLines={1}>{trip.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={Colors.lightGray} />
          <Text style={styles.metaText}>{trip.startDate} – {trip.endDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = width - 48; // full width minus horizontal padding

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.52,
  },
  info: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  tripName: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.045,
    color: Colors.darkNavy,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.034,
    color: Colors.lightGray,
    flex: 1,
  },
});
