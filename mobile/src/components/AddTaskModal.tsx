import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Category, Priority, EnergyCost } from '../types';

interface TaskFormData {
  text: string;
  priority: Priority;
  energyCost: EnergyCost;
  deadline: string | null;
  category: string | null;
  estimatedMinutes: number;
  tags: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  categories: Category[];
  initialData?: Partial<TaskFormData>;
}

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'high',   label: 'Muss sein',   color: '#ef4444' },
  { key: 'medium', label: 'Wichtig',      color: '#eab308' },
  { key: 'low',    label: 'Wäre schön',   color: '#22c55e' },
];

const ENERGIES: { key: EnergyCost; label: string; color: string }[] = [
  { key: 'low',    label: 'Niedrig', color: '#22c55e' },
  { key: 'medium', label: 'Mittel',  color: '#eab308' },
  { key: 'high',   label: 'Hoch',    color: '#ef4444' },
];

export function AddTaskModal({ visible, onClose, onSubmit, categories, initialData }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [text, setText] = useState(initialData?.text || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [energyCost, setEnergyCost] = useState<EnergyCost>(initialData?.energyCost || 'medium');
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [category, setCategory] = useState<string | null>(initialData?.category || null);

  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const inputBg = isDark ? '#2a2a3e' : '#f3f4f6';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit({
      text: text.trim(),
      priority,
      energyCost,
      deadline: deadline.trim() || null,
      category,
      estimatedMinutes: 25,
      tags: [],
    });
    setText('');
    setPriority('medium');
    setEnergyCost('medium');
    setDeadline('');
    setCategory(null);
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textPrimary }}>Neue Aufgabe</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color={textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
            {/* Text input */}
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Was möchtest du erledigen?"
              placeholderTextColor={textMuted}
              style={{
                backgroundColor: inputBg,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: textPrimary,
                marginBottom: 16,
              }}
              autoFocus
              multiline
            />

            {/* Priority */}
            <Text style={{ fontSize: 13, color: textMuted, marginBottom: 8, fontWeight: '600' }}>Wichtigkeit</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: priority === p.key ? p.color + '20' : inputBg,
                    borderWidth: 1,
                    borderColor: priority === p.key ? p.color : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, color: priority === p.key ? p.color : textMuted, fontWeight: '500' }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Energy */}
            <Text style={{ fontSize: 13, color: textMuted, marginBottom: 8, fontWeight: '600' }}>Energiebedarf</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {ENERGIES.map((e) => (
                <TouchableOpacity
                  key={e.key}
                  onPress={() => setEnergyCost(e.key)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: energyCost === e.key ? e.color + '20' : inputBg,
                    borderWidth: 1,
                    borderColor: energyCost === e.key ? e.color : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 12, color: energyCost === e.key ? e.color : textMuted, fontWeight: '500' }}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Deadline */}
            <Text style={{ fontSize: 13, color: textMuted, marginBottom: 8, fontWeight: '600' }}>Frist (YYYY-MM-DD)</Text>
            <TextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="z.B. 2025-12-31"
              placeholderTextColor={textMuted}
              style={{ backgroundColor: inputBg, borderRadius: 10, padding: 12, fontSize: 14, color: textPrimary, marginBottom: 16 }}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />

            {/* Category */}
            {categories.length > 0 && (
              <>
                <Text style={{ fontSize: 13, color: textMuted, marginBottom: 8, fontWeight: '600' }}>Kategorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setCategory(null)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: category === null ? accent : inputBg,
                      }}
                    >
                      <Text style={{ color: category === null ? '#fff' : textMuted, fontSize: 13 }}>Keine</Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: category === cat.id ? accent : inputBg,
                        }}
                      >
                        <Text style={{ color: category === cat.id ? '#fff' : textMuted, fontSize: 13 }}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                backgroundColor: accent,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                opacity: text.trim() ? 1 : 0.5,
              }}
              disabled={!text.trim()}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Aufgabe hinzufügen</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
