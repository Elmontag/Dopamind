import React from 'react';
import {
  View,
  Text,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock } from 'lucide-react-native';
import { useApp, ACHIEVEMENTS, getLevelTitle } from '../../src/context/AppContext';
import { useI18n } from '../../src/context/I18nContext';
import { XpBar } from '../../src/components/XpBar';

export default function AchievementsScreen() {
  const { state, xpForLevel, xpForNextLevel } = useApp();
  const { t, lang } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const bg = isDark ? '#0f0f17' : '#f8f8fc';
  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';

  const SIZE_COLORS: Record<string, string> = {
    small: '#6C63FF',
    medium: '#eab308',
    large: '#f97316',
  };

  const SIZE_LABELS: Record<string, string> = {
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
  };

  const unlocked = new Set(state.unlockedAchievements || []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary, marginBottom: 16 }}>Erfolge</Text>

        {/* Level overview */}
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary }}>Level {state.level}</Text>
              <Text style={{ fontSize: 14, color: accent, marginTop: 2 }}>{getLevelTitle(state.level, lang)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 22, fontWeight: '700', color: accent }}>{state.xp}</Text>
              <Text style={{ fontSize: 12, color: textMuted }}>XP gesamt</Text>
            </View>
          </View>
          <XpBar xp={state.xp} level={state.level} xpForLevel={xpForLevel} xpForNextLevel={xpForNextLevel} />

          <View style={{ flexDirection: 'row', marginTop: 14, gap: 16 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#f97316' }}>🔥 {state.currentStreakDays}</Text>
              <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Tage Streak</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>{unlocked.size}</Text>
              <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Freigeschaltet</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>{state.totalFocusMinutes}</Text>
              <Text style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Fokus-Min.</Text>
            </View>
          </View>
        </View>

        {/* Achievement groups */}
        {(['small', 'medium', 'large'] as const).map((size) => {
          const group = ACHIEVEMENTS.filter((a) => a.size === size);
          return (
            <View key={size} style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: SIZE_COLORS[size], fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' }}>
                {SIZE_LABELS[size]} ({group.filter((a) => unlocked.has(a.id)).length}/{group.length})
              </Text>
              {group.map((ach) => {
                const isUnlocked = unlocked.has(ach.id);
                const name = t(`achievements.${ach.id}.name`);
                const desc = t(`achievements.${ach.id}.desc`);
                return (
                  <View
                    key={ach.id}
                    style={{
                      backgroundColor: isUnlocked ? cardBg : (isDark ? '#141420' : '#f9f9f9'),
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: isUnlocked ? 1 : 0,
                      borderColor: isUnlocked ? SIZE_COLORS[size] + '50' : 'transparent',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: isUnlocked ? SIZE_COLORS[size] + '20' : (isDark ? '#2a2a3e' : '#e5e7eb'),
                      justifyContent: 'center', alignItems: 'center', marginRight: 12,
                    }}>
                      {isUnlocked
                        ? <Text style={{ fontSize: 18 }}>🏆</Text>
                        : <Lock size={16} color={textMuted} />
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: isUnlocked ? textPrimary : textMuted }}>{name}</Text>
                      <Text style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{desc}</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isUnlocked ? SIZE_COLORS[size] : textMuted }}>
                      +{ach.xp} XP
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
