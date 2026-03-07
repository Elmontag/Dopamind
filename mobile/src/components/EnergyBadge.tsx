import React from 'react';
import { View, Text } from 'react-native';

const ENERGY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  low:    { label: 'Niedrig', bg: '#22c55e20', text: '#22c55e' },
  medium: { label: 'Mittel',  bg: '#eab30820', text: '#eab308' },
  high:   { label: 'Hoch',    bg: '#ef444420', text: '#ef4444' },
};

interface Props {
  level: string;
}

export function EnergyBadge({ level }: Props) {
  const config = ENERGY_CONFIG[level] || ENERGY_CONFIG.medium;
  return (
    <View style={{ backgroundColor: config.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
      <Text style={{ fontSize: 10, color: config.text, fontWeight: '600' }}>⚡ {config.label}</Text>
    </View>
  );
}
