import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import TripCreationStepper from '@/components/TripCreationStepper';
import { saveDraft } from '@/constants/tripStore';

const { width, height } = Dimensions.get('window');

function formatDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function TripNameAndDatesPage() {
  const router = useRouter();

  const [tripName,       setTripName]       = useState('');
  const [startDate,      setStartDate]      = useState<Date | null>(null);
  const [endDate,        setEndDate]        = useState<Date | null>(null);
  const [tempDate,       setTempDate]       = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker,   setShowEndPicker]   = useState(false);
  const [nameError,      setNameError]      = useState('');
  const [dateError,      setDateError]      = useState('');

  // ── Validation ────────────────────────────────────────────
  const validate = (): boolean => {
    let valid = true;

    if (!tripName.trim()) {
      setNameError('Trip name is required.');
      valid = false;
    } else {
      setNameError('');
    }

    if (startDate && endDate && endDate <= startDate) {
      setDateError('End date must be after start date.');
      valid = false;
    } else {
      setDateError('');
    }

    return valid;
  };

  const handleNext = async () => {
    if (!validate()) return;
    await saveDraft({
      name: tripName.trim(),
      startDate: startDate ? startDate.toISOString() : null,
      endDate:   endDate   ? endDate.toISOString()   : null,
    });
    router.push('/(onboarding)/invite-collaborators');
  };

  // ── Date picker helpers ───────────────────────────────────
  const openStartPicker = () => {
    setTempDate(startDate ?? new Date());
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setTempDate(endDate ?? startDate ?? new Date());
    setShowEndPicker(true);
  };

  const confirmStart = () => {
    setStartDate(tempDate);
    // Clear end date if it's now invalid
    if (endDate && tempDate >= endDate) setEndDate(null);
    setDateError('');
    setShowStartPicker(false);
  };

  const confirmEnd = () => {
    if (startDate && tempDate <= startDate) {
      setDateError('End date must be after start date.');
    } else {
      setEndDate(tempDate);
      setDateError('');
    }
    setShowEndPicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      {/* ── Header row ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <Text style={styles.logoText}>On the </Text>
          <Text style={styles.logoAccent}>GO!</Text>
        </View>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={handleNext}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Stepper ── */}
      <TripCreationStepper activeStep={1} />

      {/* ── Form ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Name */}
        <Text style={styles.fieldLabel}>
          Trip Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grad Trip 2026"
            placeholderTextColor={Colors.lightGray}
            value={tripName}
            onChangeText={text => {
              setTripName(text);
              if (text.trim()) setNameError('');
            }}
            returnKeyType="done"
          />
        </View>
        {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

        {/* Start Date */}
        <Text style={[styles.fieldLabel, { marginTop: height * 0.028 }]}>
          Start Date
        </Text>
        <TouchableOpacity
          style={[styles.inputWrapper, styles.dateInputWrapper]}
          onPress={openStartPicker}
          activeOpacity={0.8}
        >
          <Text style={[styles.input, !startDate && styles.placeholder]}>
            {startDate ? formatDate(startDate) : 'mm/dd/yyyy'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.lightGray} />
        </TouchableOpacity>

        {/* End Date */}
        <Text style={[styles.fieldLabel, { marginTop: height * 0.028 }]}>
          End Date
        </Text>
        <TouchableOpacity
          style={[styles.inputWrapper, styles.dateInputWrapper, dateError ? styles.inputError : null]}
          onPress={openEndPicker}
          activeOpacity={0.8}
        >
          <Text style={[styles.input, !endDate && styles.placeholder]}>
            {endDate ? formatDate(endDate) : 'mm/dd/yyyy'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.lightGray} />
        </TouchableOpacity>
        {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}

        {/* Next button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>

      {/* ── Start Date Picker Modal ── */}
      <Modal visible={showStartPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Start Date</Text>
              <TouchableOpacity onPress={confirmStart}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => date && setTempDate(date)}
              minimumDate={new Date()}
              themeVariant="light"
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>

      {/* ── End Date Picker Modal ── */}
      <Modal visible={showEndPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>End Date</Text>
              <TouchableOpacity onPress={confirmEnd}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => date && setTempDate(date)}
              minimumDate={startDate ?? new Date()}
              themeVariant="light"
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>

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
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.015,
    paddingBottom: height * 0.028,
  },
  navBtn: {
    width: 40,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
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

  // ── Form ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.04,
  },
  fieldLabel: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.04,
    color: Colors.white,
    marginBottom: 8,
  },
  required: {
    color: Colors.yellow,
  },
  inputWrapper: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: height * 0.018,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.04,
    color: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: height * 0.018,
  },
  placeholder: {
    color: Colors.lightGray,
  },
  errorText: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.033,
    color: '#ffcccc',
    marginTop: 5,
  },

  // ── Next button ──
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.darkNavy,
    borderRadius: Radius.md,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.045,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonText: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.white,
  },

  // ── Date picker modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.042,
    color: Colors.darkNavy,
  },
  pickerCancel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.038,
    color: Colors.lightGray,
  },
  pickerDone: {
    fontFamily: FontFamily.merriweatherBold,
    fontSize: width * 0.038,
    color: Colors.darkNavy,
  },
  picker: {
    width: '100%',
  },
});
