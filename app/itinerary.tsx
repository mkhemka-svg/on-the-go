import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import ItineraryItemCard, { ItineraryItem } from '@/components/ItineraryItemCard';

const { width, height } = Dimensions.get('window');
const H_PADDING = width * 0.06;

// ── Hardcoded placeholder items ──────────────────────────────
const INITIAL_ITEMS: ItineraryItem[] = [
  {
    id: '1',
    title: 'F1 Arcade',
    description: 'Racing simulator experience. Multiple simulators available — book a bay ahead for weekends.',
    scheduledDate: '4/15',
    scheduledTime: '1:00 pm',
  },
  {
    id: '2',
    title: 'Dinner at Strega',
    description: 'Upscale Italian restaurant in the North End. Known for the pasta and ambiance. Make a reservation.',
    scheduledDate: '4/15',
    scheduledTime: '7:30 pm',
  },
  {
    id: '3',
    title: 'Duck Tour',
    description: 'Boston Duck Tour — land and water sightseeing experience through the city.',
    scheduledDate: '4/16',
    scheduledTime: '10:00 am',
  },
  {
    id: '4',
    title: 'Fenway Park Visit',
    description: 'Guided tour of the historic ballpark. Check the Red Sox schedule for a game option.',
    scheduledDate: '4/16',
    scheduledTime: '2:00 pm',
  },
  {
    id: '5',
    title: 'Rooftop Bar Night',
    description: 'Drinks and panoramic city views at Lookout Rooftop & Bar. 21+ only.',
    scheduledDate: '4/17',
    scheduledTime: '8:00 pm',
  },
];

// ── Helpers ───────────────────────────────────────────────────

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

function formatScheduledDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ── Main Screen ───────────────────────────────────────────────

export default function ItineraryPage() {
  const [items, setItems]                       = useState<ItineraryItem[]>(INITIAL_ITEMS);
  const [expandedId, setExpandedId]             = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible]   = useState(false);
  const [addModalVisible, setAddModalVisible]   = useState(false);

  // Add form fields
  const [formTitle, setFormTitle]               = useState('');
  const [formDescription, setFormDescription]   = useState('');
  const [formDate, setFormDate]                 = useState(new Date());
  const [formTime, setFormTime]                 = useState(new Date());
  const [formTitleError, setFormTitleError]     = useState('');
  const [showDatePicker, setShowDatePicker]     = useState(false);
  const [showTimePicker, setShowTimePicker]     = useState(false);
  const [pendingDate, setPendingDate]           = useState(new Date());
  const [pendingTime, setPendingTime]           = useState(new Date());

  // ── Toggle card expand ─────────────────────────────────────
  const handleToggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // ── Attach actions ─────────────────────────────────────────
  const handleUploadFile = async () => {
    setDropdownVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        Alert.alert('File attached', result.assets[0].name ?? 'File selected successfully.');
      }
    } catch {
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const handleTakePhoto = async () => {
    setDropdownVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      });
      if (!result.canceled && result.assets?.length) {
        Alert.alert('Photo captured', 'Photo ready to attach to your itinerary.');
      }
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  // ── Open add form ──────────────────────────────────────────
  const handleOpenAddForm = () => {
    const now = new Date();
    setFormTitle('');
    setFormDescription('');
    setFormDate(now);
    setFormTime(now);
    setFormTitleError('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setPendingDate(now);
    setPendingTime(now);
    setAddModalVisible(true);
  };

  // ── Save item ──────────────────────────────────────────────
  const handleSaveItem = () => {
    if (!formTitle.trim()) {
      setFormTitleError('Activity title is required.');
      return;
    }
    const newItem: ItineraryItem = {
      id: String(Date.now()),
      title: formTitle.trim(),
      description: formDescription.trim(),
      scheduledDate: formatScheduledDate(formDate),
      scheduledTime: formatTime(formTime),
    };
    setItems(prev => [...prev, newItem]);
    setAddModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => setDropdownVisible(prev => !prev)}
          activeOpacity={0.8}
        >
          <Ionicons name="attach" size={18} color={Colors.white} />
          <Text style={styles.attachLabel}>Attach</Text>
        </TouchableOpacity>
      </View>

      {/* ── Attach dropdown ── */}
      {dropdownVisible && (
        <>
          <Pressable style={styles.dropdownBackdrop} onPress={() => setDropdownVisible(false)} />
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownOption} onPress={handleUploadFile} activeOpacity={0.8}>
              <Ionicons name="document-attach-outline" size={20} color={Colors.darkNavy} />
              <Text style={styles.dropdownOptionText}>Upload File</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity style={styles.dropdownOption} onPress={handleTakePhoto} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={20} color={Colors.darkNavy} />
              <Text style={styles.dropdownOptionText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Scrollable content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>My Itinerary</Text>
        <Text style={styles.votedLabel}>To be voted on:</Text>

        {/* Add item tap target */}
        <TouchableOpacity
          style={styles.addInputRow}
          onPress={handleOpenAddForm}
          activeOpacity={0.8}
        >
          <Text style={styles.addInputPlaceholder}>Add a new item to your list</Text>
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </View>
        </TouchableOpacity>

        {/* Items list */}
        <View>
          {items.map(item => (
            <ItineraryItemCard
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={handleToggle}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Add Activity Form Modal ── */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setAddModalVisible(false)} />
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Activity</Text>

            <Text style={styles.fieldLabel}>Activity Title *</Text>
            <TextInput
              style={[styles.fieldInput, !!formTitleError && styles.fieldInputError]}
              placeholder="e.g. F1 Arcade"
              placeholderTextColor={Colors.lightGray}
              value={formTitle}
              onChangeText={text => { setFormTitle(text); setFormTitleError(''); }}
              returnKeyType="next"
            />
            {!!formTitleError && <Text style={styles.fieldError}>{formTitleError}</Text>}

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti]}
              placeholder="Add notes or details..."
              placeholderTextColor={Colors.lightGray}
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => { setPendingDate(formDate); setShowDatePicker(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.darkNavy} />
              <Text style={styles.dateFieldText}>{formatDate(formDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Time</Text>
            <TouchableOpacity
              style={styles.dateField}
              onPress={() => { setPendingTime(formTime); setShowTimePicker(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={16} color={Colors.darkNavy} />
              <Text style={styles.dateFieldText}>{formatTime(formTime)}</Text>
            </TouchableOpacity>

            <View style={styles.formButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveItem}
                activeOpacity={0.85}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Date Picker Modal ── */}
      {showDatePicker && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerModal}>
            <View style={styles.pickerCard}>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="spinner"
                onChange={(_, d) => { if (d) setPendingDate(d); }}
                textColor={Colors.darkNavy}
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setFormDate(pendingDate); setShowDatePicker(false); }}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Time Picker Modal ── */}
      {showTimePicker && (
        <Modal transparent animationType="fade">
          <View style={styles.pickerModal}>
            <View style={styles.pickerCard}>
              <DateTimePicker
                value={pendingTime}
                mode="time"
                display="spinner"
                onChange={(_, t) => { if (t) setPendingTime(t); }}
                textColor={Colors.darkNavy}
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setFormTime(pendingTime); setShowTimePicker(false); }}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <BottomNavigationBar activeTab="itinerary" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.signInBlue,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop: height * 0.012,
    paddingBottom: height * 0.018,
  },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoText: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.085,
    color: Colors.white,
  },
  logoAccent: {
    fontFamily: FontFamily.acme,
    fontSize: width * 0.085,
    color: Colors.yellow,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  attachLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.033,
    color: Colors.white,
  },

  // ── Dropdown ──
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  dropdown: {
    position: 'absolute',
    top: height * 0.13,
    right: H_PADDING,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 6,
    minWidth: width * 0.46,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 20,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownOptionText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: Colors.darkNavy,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#eef1f8',
    marginHorizontal: 12,
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: height * 0.14,
  },

  // ── Headings ──
  heading: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.07,
    color: Colors.white,
    marginBottom: height * 0.006,
  },
  votedLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: height * 0.018,
  },

  // ── Add input ──
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: height * 0.017,
    marginBottom: height * 0.022,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 10,
  },
  addInputPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.lightGray,
  },
  addIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Add Form Modal ──
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: H_PADDING,
    paddingTop: height * 0.028,
    paddingBottom: height * 0.04,
  },
  formTitle: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.052,
    color: Colors.darkNavy,
    marginBottom: height * 0.024,
  },
  fieldLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.033,
    color: Colors.darkNavy,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#d0daea',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: height * 0.015,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: Colors.black,
    marginBottom: height * 0.018,
  },
  fieldInputError: {
    borderColor: Colors.red,
  },
  fieldInputMulti: {
    height: height * 0.1,
  },
  fieldError: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.03,
    color: Colors.red,
    marginTop: -(height * 0.012),
    marginBottom: height * 0.014,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#d0daea',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.018,
  },
  dateFieldText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.036,
    color: Colors.darkNavy,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: height * 0.006,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.darkNavy,
    borderRadius: Radius.md,
    paddingVertical: height * 0.018,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.038,
    color: Colors.darkNavy,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    paddingVertical: height * 0.018,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.038,
    color: Colors.white,
  },

  // ── Date/Time Picker Modal ──
  pickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: height * 0.04,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingBottom: 8,
  },
  pickerCancel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.04,
    color: Colors.lightGray,
  },
  pickerDone: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.darkNavy,
  },
});
