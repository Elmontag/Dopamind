import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { getLevelTitle } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';

interface Props {
  xp: number;
  level: number;
  xpForLevel: (l: number) => number;
  xpForNextLevel: (l: number) => number;
}

export function XpBar({ xp, level, xpForLevel, xpForNextLevel }: Props) {
  const { lang } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const progress =
    nextLevelXp > currentLevelXp
      ? Math.min(100, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
      : 0;

  const title = getLevelTitle(level, lang);
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';

  return (
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', flexShrink: 0 }}>{xp} XP</Text>
        <View style={{ flex: 1, height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: accent, borderRadius: 3 }} />
        </View>
        <Text style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', flexShrink: 0 }}>Lv.{level + 1}</Text>
      </View>
      <Text style={{ fontSize: 10, color: textMuted }}>{title}</Text>
    </View>
  );
}
