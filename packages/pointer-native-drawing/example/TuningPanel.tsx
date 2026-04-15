import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { WritingFeelConfig } from 'pointer-native-drawing';

interface SliderRow {
  key: keyof WritingFeelConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

// Only centerline-relevant sliders are active. Variable-width params are
// deprecated and hidden (pressureGamma, pressureWeight, velocityWeight,
// velocityThinningK, widthSmoothing, tiltSensitivity).
const SLIDERS: SliderRow[] = [
  { key: 'minWidth', label: 'Min Width', min: 0.3, max: 5, step: 0.1 },
  { key: 'maxWidth', label: 'Max Width', min: 2, max: 12, step: 0.1 },
  {
    key: 'velocitySmoothing',
    label: 'Vel Smooth',
    min: 0.01,
    max: 0.5,
    step: 0.01,
  },
];

interface TuningPanelProps {
  config: WritingFeelConfig;
  onConfigChange: (config: WritingFeelConfig) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function TuningPanel({
  config,
  onConfigChange,
  onReset,
  onClose,
}: TuningPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WritingFeel Tuning</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SLIDERS.map(({ key, label, min, max, step }) => (
          <View key={key} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{config[key].toFixed(2)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={min}
              maximumValue={max}
              step={step}
              value={config[key]}
              onValueChange={(v: number) =>
                onConfigChange({ ...config, [key]: v })
              }
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#D0D0D0"
              thumbTintColor="#007AFF"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '50%',
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C0C0C0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1E1E21' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  resetText: { fontSize: 13, fontWeight: '600', color: '#E53935' },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  closeText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { marginVertical: 2 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -2,
  },
  label: { fontSize: 12, fontWeight: '500', color: '#555' },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 40,
    textAlign: 'right',
  },
  slider: { width: '100%', height: 32 },
});
