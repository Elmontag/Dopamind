import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { useI18n } from '../../src/context/I18nContext';
import { TaskCard } from '../../src/components/TaskCard';
import { AddTaskModal } from '../../src/components/AddTaskModal';
import { RewardToast } from '../../src/components/RewardToast';
import { FocusTimerWidget } from '../../src/components/FocusTimerWidget';
import { getTodayStr } from '../../src/utils/date';
import { Task } from '../../src/types';

type Filter = 'all' | 'today' | 'done';
type SortKey = 'priority' | 'deadline' | 'created';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks: Task[], sortKey: SortKey): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortKey === 'priority') return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    if (sortKey === 'deadline') {
      if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return 0;
    }
    return b.createdAt - a.createdAt;
  });
}

export default function TasksScreen() {
  const { state, dispatch } = useApp();
  const { t } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const today = getTodayStr();

  const bg = isDark ? '#0f0f17' : '#f8f8fc';
  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';

  const filtered = state.tasks.filter((t) => {
    if (filter === 'done') return t.completed;
    if (filter === 'today') return !t.completed && (!t.scheduledDate || t.scheduledDate === today);
    return !t.completed;
  });

  const sorted = sortTasks(filtered, sortKey);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Alle' },
    { key: 'today', label: 'Heute' },
    { key: 'done', label: 'Erledigt' },
  ];

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'priority', label: 'Priorität' },
    { key: 'deadline', label: 'Frist' },
    { key: 'created', label: 'Erstellt' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary, marginBottom: 12 }}>Aufgaben</Text>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: filter === f.key ? accent : (isDark ? '#2a2a3e' : '#e5e7eb'),
                }}
              >
                <Text style={{ color: filter === f.key ? '#fff' : textMuted, fontSize: 13, fontWeight: '500' }}>{f.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ width: 16 }} />
            {SORTS.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => setSortKey(s.key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: sortKey === s.key ? accent + '30' : 'transparent',
                  borderWidth: 1,
                  borderColor: sortKey === s.key ? accent : (isDark ? '#3a3a4e' : '#d1d5db'),
                }}
              >
                <Text style={{ color: sortKey === s.key ? accent : textMuted, fontSize: 12 }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Task list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 100 }}>
        {sorted.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 15, color: textMuted }}>Keine Aufgaben gefunden</Text>
            <Text style={{ fontSize: 13, color: textMuted, marginTop: 4 }}>Füge eine neue Aufgabe hinzu!</Text>
          </View>
        ) : (
          sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => dispatch({ type: filter === 'done' ? 'REOPEN_TASK' : 'COMPLETE_TASK', payload: task.id })}
              onDelete={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
              showSubtasks
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 90,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: accent,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      <AddTaskModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={(task) => {
          dispatch({ type: 'ADD_TASK', payload: task });
          setAddModalVisible(false);
        }}
        categories={state.categories}
      />

      <RewardToast />
      <FocusTimerWidget />
    </SafeAreaView>
  );
}
