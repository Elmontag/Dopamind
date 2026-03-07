import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';
import { useCalendar } from '../../src/context/CalendarContext';
import { useI18n } from '../../src/context/I18nContext';
import { TaskCard } from '../../src/components/TaskCard';
import { getTodayStr, shiftDate, formatDate } from '../../src/utils/date';
import { CalendarEvent } from '../../src/types';

function getWeekDays(startDate: string): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(shiftDate(startDate, i));
  return days;
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export default function PlannerScreen() {
  const { state, dispatch } = useApp();
  const { state: calState, addEvent, deleteEvent, getEventsForDate } = useCalendar();
  const { lang } = useI18n();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const today = getTodayStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(getMonday(today));
  const [addEventModal, setAddEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('09:00');
  const [eventEnd, setEventEnd] = useState('10:00');

  const weekDays = getWeekDays(weekStart);
  const dayTasks = state.tasks.filter((t) => !t.completed && t.scheduledDate === selectedDate);
  const dayEvents = getEventsForDate(selectedDate);

  const bg = isDark ? '#0f0f17' : '#f8f8fc';
  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';
  const borderColor = isDark ? '#2a2a3e' : '#e5e7eb';

  async function handleAddEvent() {
    if (!eventTitle.trim()) return;
    await addEvent({
      title: eventTitle.trim(),
      date: selectedDate,
      start: eventStart,
      end: eventEnd,
      allDay: false,
    });
    setEventTitle('');
    setEventStart('09:00');
    setEventEnd('10:00');
    setAddEventModal(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Week strip */}
      <View style={{ backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: borderColor, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => setWeekStart(shiftDate(weekStart, -7))} style={{ padding: 4 }}>
            <ChevronLeft size={20} color={textMuted} />
          </TouchableOpacity>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: textPrimary }}>
            {formatDate(weekStart, lang).split(',')[1]?.trim() || weekStart}
          </Text>
          <TouchableOpacity onPress={() => setWeekStart(shiftDate(weekStart, 7))} style={{ padding: 4 }}>
            <ChevronRight size={20} color={textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6, flexDirection: 'row' }}>
          {weekDays.map((day, i) => {
            const isSelected = day === selectedDate;
            const isToday = day === today;
            const dayNum = parseInt(day.split('-')[2], 10);
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDate(day)}
                style={{
                  width: 44,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isSelected ? accent : 'transparent',
                }}
              >
                <Text style={{ fontSize: 11, color: isSelected ? '#fff' : textMuted, marginBottom: 4 }}>{DAY_LABELS[i]}</Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: isToday ? '700' : '500',
                  color: isSelected ? '#fff' : (isToday ? accent : textPrimary),
                }}>
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary, marginBottom: 12 }}>
          {formatDate(selectedDate, lang)}
        </Text>

        {/* Events */}
        {dayEvents.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: '600', marginBottom: 8 }}>TERMINE</Text>
            {dayEvents.map((event) => (
              <View key={event.id} style={{ backgroundColor: cardBg, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: textPrimary }}>{event.title}</Text>
                  {!event.allDay && (
                    <Text style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{event.start} – {event.end}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => deleteEvent(event.id)} style={{ padding: 6 }}>
                  <Text style={{ color: '#ef4444', fontSize: 12 }}>Löschen</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Tasks */}
        {dayTasks.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: accent, fontWeight: '600', marginBottom: 8 }}>AUFGABEN</Text>
            {dayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => dispatch({ type: 'COMPLETE_TASK', payload: task.id })}
              />
            ))}
          </View>
        )}

        {dayEvents.length === 0 && dayTasks.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: textMuted, fontSize: 15 }}>Nichts geplant für diesen Tag</Text>
          </View>
        )}
      </ScrollView>

      {/* Add event FAB */}
      <TouchableOpacity
        onPress={() => setAddEventModal(true)}
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
          elevation: 6,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        }}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal visible={addEventModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary, marginBottom: 16 }}>Neuer Termin</Text>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Titel..."
              placeholderTextColor={textMuted}
              style={{ backgroundColor: isDark ? '#2a2a3e' : '#f3f4f6', borderRadius: 10, padding: 12, fontSize: 15, color: textPrimary, marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>Start</Text>
                <TextInput
                  value={eventStart}
                  onChangeText={setEventStart}
                  placeholder="09:00"
                  placeholderTextColor={textMuted}
                  style={{ backgroundColor: isDark ? '#2a2a3e' : '#f3f4f6', borderRadius: 10, padding: 12, fontSize: 14, color: textPrimary }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: textMuted, marginBottom: 4 }}>Ende</Text>
                <TextInput
                  value={eventEnd}
                  onChangeText={setEventEnd}
                  placeholder="10:00"
                  placeholderTextColor={textMuted}
                  style={{ backgroundColor: isDark ? '#2a2a3e' : '#f3f4f6', borderRadius: 10, padding: 12, fontSize: 14, color: textPrimary }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setAddEventModal(false)} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: isDark ? '#2a2a3e' : '#e5e7eb', alignItems: 'center' }}>
                <Text style={{ color: textMuted, fontWeight: '500' }}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddEvent} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: accent, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Hinzufügen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
