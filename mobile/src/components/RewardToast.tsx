import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, useColorScheme } from 'react-native';
import { X } from 'lucide-react-native';
import { useApp, getLevelTitle } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';
import { useSettings } from '../context/SettingsContext';

export function RewardToast() {
  const { state, dispatch } = useApp();
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const activeRewards = state.rewards.slice(-3);
  const latest = activeRewards[0];

  useEffect(() => {
    if (!latest) return;
    fadeAnim.setValue(1);
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        dispatch({ type: 'DISMISS_REWARD', payload: latest.id });
      });
    }, 3500);
    return () => clearTimeout(timer);
  }, [latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (activeRewards.length === 0) return null;

  const cardBg = isDark ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.97)';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View style={{ position: 'absolute', bottom: 90, right: 16, zIndex: 100, gap: 8 }}>
      {activeRewards.map((r) => {
        const isPenalty = r.type === 'overdue-penalty' || r.type === 'inactivity-penalty';
        const title = r.type === 'level-up' && r.level ? getLevelTitle(r.level, lang) : '';
        const name = r.achievementId ? t(`achievements.${r.achievementId}.name`) : '';
        const message = r.messageKey
          ? t(r.messageKey, { level: r.level ?? 0, title, name, xp: r.xp ?? 0, days: r.days ?? 0, daysOverdue: r.daysOverdue ?? 0 })
          : (r.message || '');

        return (
          <Animated.View
            key={r.id}
            style={{
              opacity: r.id === latest?.id ? fadeAnim : 1,
              backgroundColor: cardBg,
              borderRadius: 12,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              minWidth: 220,
              maxWidth: 300,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 1,
              borderColor: isPenalty ? '#ef444430' : (r.size === 'large' ? '#eab30840' : '#6C63FF30'),
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {isPenalty ? '⚠️' : r.type === 'level-up' ? '🎉' : r.size === 'large' ? '🏆' : '⭐'}
            </Text>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: textPrimary }}>{message}</Text>
            <TouchableOpacity onPress={() => dispatch({ type: 'DISMISS_REWARD', payload: r.id })} style={{ padding: 2 }}>
              <X size={14} color={textMuted} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
