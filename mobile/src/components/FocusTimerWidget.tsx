import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Pause, Play, Square, AlertTriangle } from 'lucide-react-native';
import { useFocusTimer } from '../context/FocusTimerContext';
import { useApp } from '../context/AppContext';
import { useI18n } from '../context/I18nContext';

export function FocusTimerWidget() {
  const { state, dispatch } = useFocusTimer();
  const { dispatch: appDispatch } = useApp();
  const { t } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (!state.activeTaskId) return null;

  const elapsed = state.taskElapsed;
  const estimatedSec = (state.activeTaskEstimated || 0) * 60;
  const pct = estimatedSec > 0 ? elapsed / estimatedSec : 0;

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeStr =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isOverrun = pct >= 1.0;
  const barColor = isOverrun ? '#ef4444' : pct >= 0.8 ? '#eab308' : '#6C63FF';

  const cardBg = isDark ? 'rgba(26,26,46,0.97)' : 'rgba(255,255,255,0.97)';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';

  function handleStop() {
    const focusMinutes = Math.max(1, Math.round(elapsed / 60));
    appDispatch({ type: 'ADD_FOCUS_MINUTES', payload: focusMinutes });
    appDispatch({
      type: 'LOG_TASK_TIME',
      payload: {
        id: Date.now().toString(36),
        taskId: state.activeTaskId,
        sizeCategory: state.activeTaskSize || null,
        estimatedMin: state.activeTaskEstimated || 0,
        actualMin: focusMinutes,
        startedAt: state.taskStartedAt || null,
        stoppedAt: new Date().toISOString(),
      },
    });
    dispatch({ type: 'STOP_TASK_TIMER' });
  }

  return (
    <View style={{
      position: 'absolute',
      bottom: 90,
      left: 16,
      backgroundColor: cardBg,
      borderRadius: 14,
      padding: 12,
      minWidth: 200,
      maxWidth: 260,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#6C63FF30',
      zIndex: 50,
    }}>
      {/* Progress bar */}
      {estimatedSec > 0 && (
        <View style={{ height: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${Math.min(pct * 100, 100)}%`, backgroundColor: barColor, borderRadius: 2 }} />
        </View>
      )}

      {isOverrun && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <AlertTriangle size={12} color="#ef4444" />
          <Text style={{ fontSize: 11, color: '#ef4444' }}>
            {t('timer.overrun', { min: Math.round((elapsed - estimatedSec) / 60) })}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: state.taskRunning ? '#22c55e' : '#eab308' }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '500', color: textPrimary }}>{state.activeTaskText}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#6C63FF' }}>{timeStr}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {state.taskRunning ? (
            <TouchableOpacity onPress={() => dispatch({ type: 'PAUSE_TASK_TIMER' })} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#eab30820', justifyContent: 'center', alignItems: 'center' }}>
              <Pause size={14} color="#eab308" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => dispatch({ type: 'RESUME_TASK_TIMER' })} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#22c55e20', justifyContent: 'center', alignItems: 'center' }}>
              <Play size={14} color="#22c55e" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleStop} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ef444420', justifyContent: 'center', alignItems: 'center' }}>
            <Square size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
