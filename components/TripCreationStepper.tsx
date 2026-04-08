import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface StepConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const STEPS: StepConfig[] = [
  { icon: 'calendar',  label: 'Dates'  },
  { icon: 'people',    label: 'Crew'   },
  { icon: 'location',  label: 'Place'  },
];

interface Props {
  activeStep: 1 | 2 | 3;
}

export default function TripCreationStepper({ activeStep }: Props) {
  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive   = stepNumber === activeStep;
        const isComplete = stepNumber < activeStep;

        return (
          <View key={stepNumber} style={styles.stepRow}>
            {/* ── Step circle ── */}
            <View style={styles.stepCol}>
              <View style={[
                styles.circle,
                isActive   && styles.circleActive,
                isComplete && styles.circleComplete,
              ]}>
                <Ionicons
                  name={step.icon}
                  size={width * 0.052}
                  color={isActive || isComplete ? Colors.darkNavy : Colors.white}
                />
              </View>
              <Text style={[
                styles.stepLabel,
                isActive   && styles.stepLabelActive,
              ]}>
                {step.label}
              </Text>
            </View>

            {/* ── Connector line (not after last step) ── */}
            {index < STEPS.length - 1 && (
              <View style={[
                styles.connector,
                isComplete && styles.connectorComplete,
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: width * 0.06,
    marginBottom: width * 0.06,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCol: {
    alignItems: 'center',
  },
  circle: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.065,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  circleActive: {
    backgroundColor: Colors.yellow,
    borderColor: Colors.yellow,
  },
  circleComplete: {
    backgroundColor: Colors.lightYellow,
    borderColor: Colors.lightYellow,
  },
  stepLabel: {
    fontFamily: FontFamily.merriweather,
    fontSize: width * 0.028,
    color: 'rgba(255,255,255,0.6)',
  },
  stepLabelActive: {
    color: Colors.yellow,
    fontFamily: FontFamily.merriweatherBold,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: width * 0.05,
    marginHorizontal: 4,
  },
  connectorComplete: {
    backgroundColor: Colors.lightYellow,
  },
});
