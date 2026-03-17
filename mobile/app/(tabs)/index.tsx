import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Zap } from 'lucide-react-native';
import { useApp, getLevelTitle, DAILY_CHALLENGES } from '../../src/context/AppContext';
import { useI18n } from '../../src/context/I18nContext';
import { useSettings } from '../../src/context/SettingsContext';
import { XpBar } from '../../src/components/XpBar';
import { RewardToast } from '../../src/components/RewardToast';
import { TaskCard } from '../../src/components/TaskCard';
import { FocusTimerWidget } from '../../src/components/FocusTimerWidget';
import { getTodayStr, formatDate } from '../../src/utils/date';
import { getNextTask, getTasksForTimeBlock } from '../../src/utils/task';

const ENERGY_LEVELS = [
  { key: 'low',    label: 'Niedrig', color: '#22c55e' },
  { key: 'medium', label: 'Mittel',  color: '#eab308' },
  { key: 'high',   label: 'Hoch',    color: '#ef4444' },
] as const;

const TIME_BLOCKS = [
  { key: 'morning'   as const, label: '🌅 Morgen'    },
  { key: 'afternoon' as const, label: '☀️ Mittag'   },
  { key: 'evening'   as const, label: '🌙 Abend'     },
];

export default function HomeScreen() {
  const { state, dispatch, xpForLevel, xpForNextLevel } = useApp();
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const today = getTodayStr();
  const formattedDate = formatDate(today, lang);

  const energyCheckNeeded =
    settings.gamification.energyCheckinEnabled &&
    (!state.energyLevel || state.energyCheckDate !== today);

  const [energyModalVisible, setEnergyModalVisible] = useState(energyCheckNeeded);

  const nextTask = getNextTask(state.tasks, today, state.energyLevel);

  const currentChallenge = state.dailyChallenge;
  const challengeDef = currentChallenge
    ? DAILY_CHALLENGES.find((d) => d.id === currentChallenge.challengeId)
    : null;
  const challengeProgress = challengeDef
    ? Math.min(1, (challengeDef.type === 'complete_tasks' ? state.completedToday : state.focusMinutesToday) / challengeDef.target)
    : 0;

  const bg = isDark ? '#0f0f17' : '#f8f8fc';
  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';

  function handleSetEnergy(level: string) {
    dispatch({ type: 'SET_ENERGY_LEVEL', payload: level });
    setEnergyModalVisible(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Energy check-in modal */}
      <Modal visible={energyModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 8 }}>
              Wie ist dein Energielevel?
            </Text>
            <Text style={{ fontSize: 14, color: textMuted, marginBottom: 20 }}>
              Wähle dein aktuelles Energielevel für heute.
            </Text>
            {ENERGY_LEVELS.map((e) => (
              <TouchableOpacity
                key={e.key}
                onPress={() => handleSetEnergy(e.key)}
                style={{
                  backgroundColor: e.color + '20',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: e.color + '60',
                }}
              >
                <Text style={{ color: e.color, fontWeight: '600', textAlign: 'center' }}>{e.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setEnergyModalVisible(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: textMuted, textAlign: 'center', fontSize: 13 }}>Überspringen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary }}>{formattedDate}</Text>
          {state.energyLevel && (
            <TouchableOpacity onPress={() => setEnergyModalVisible(true)} style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Zap size={14} color={ENERGY_LEVELS.find(e => e.key === state.energyLevel)?.color || textMuted} />
              <Text style={{ fontSize: 13, color: textMuted }}>
                Energie: {ENERGY_LEVELS.find(e => e.key === state.energyLevel)?.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* XP Bar */}
        <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: textPrimary }}>
              Level {state.level} – {getLevelTitle(state.level, lang)}
            </Text>
            {state.currentStreakDays > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Flame size={14} color="#f97316" />
                <Text style={{ fontSize: 13, color: '#f97316', fontWeight: '600' }}>{state.currentStreakDays} Tage</Text>
              </View>
            )}
          </View>
          <XpBar xp={state.xp} level={state.level} xpForLevel={xpForLevel} xpForNextLevel={xpForNextLevel} />
        </View>

        {/* Daily Challenge */}
        {challengeDef && currentChallenge && (
          <View style={{ backgroundColor: cardBg, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: '600', marginBottom: 4 }}>TAGES-CHALLENGE</Text>
            <Text style={{ fontSize: 14, color: textPrimary, marginBottom: 8 }}>
              {challengeDef.type === 'complete_tasks'
                ? `${state.completedToday} / ${challengeDef.target} Aufgaben erledigt`
                : `${state.focusMinutesToday} / ${challengeDef.target} Fokus-Minuten`}
            </Text>
            <View style={{ height: 6, backgroundColor: isDark ? '#2a2a3e' : '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${challengeProgress * 100}%`, backgroundColor: currentChallenge.completed ? '#22c55e' : accent, borderRadius: 3 }} />
            </View>
          </View>
        )}

        {/* Next Task */}
        {nextTask && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: '600', marginBottom: 8 }}>NÄCHSTE AUFGABE</Text>
            <TaskCard task={nextTask} onComplete={() => dispatch({ type: 'COMPLETE_TASK', payload: nextTask.id })} highlighted />
          </View>
        )}

        {/* Time blocks */}
        {TIME_BLOCKS.map(({ key, label }) => {
          const blockTasks = getTasksForTimeBlock(state.tasks, key, today);
          if (blockTasks.length === 0) return null;
          return (
            <View key={key} style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 13, color: textMuted, fontWeight: '600', marginBottom: 8 }}>{label}</Text>
              {blockTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => dispatch({ type: 'COMPLETE_TASK', payload: task.id })}
                />
              ))}
            </View>
          );
        })}
      </ScrollView>

      <RewardToast />
      <FocusTimerWidget />
    </SafeAreaView>
  );
}
