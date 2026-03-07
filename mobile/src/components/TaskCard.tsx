import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { Task } from '../types';
import { EnergyBadge } from './EnergyBadge';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#22c55e',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Muss sein',
  medium: 'Wichtig',
  low: 'Wäre schön',
};

interface Props {
  task: Task;
  onComplete: () => void;
  onDelete?: () => void;
  highlighted?: boolean;
  showSubtasks?: boolean;
}

export function TaskCard({ task, onComplete, onDelete, highlighted, showSubtasks }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [expanded, setExpanded] = useState(false);

  const cardBg = isDark ? '#1a1a2e' : '#ffffff';
  const textPrimary = isDark ? '#f9fafb' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#6C63FF';
  const priorityColor = PRIORITY_COLORS[task.priority] || '#6b7280';

  const isOverdue = task.deadline && task.deadline < new Date().toISOString().split('T')[0] && !task.completed;

  return (
    <View style={{
      backgroundColor: cardBg,
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
      borderWidth: highlighted ? 1 : 0,
      borderColor: highlighted ? accent : 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    }}>
      {/* Priority stripe */}
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: priorityColor }} />

      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 16 }}>
          {/* Checkbox */}
          <TouchableOpacity
            onPress={onComplete}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: task.completed ? accent : (isDark ? '#4a4a6e' : '#d1d5db'),
              backgroundColor: task.completed ? accent : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
              flexShrink: 0,
            }}
          >
            {task.completed && <Check size={12} color="#fff" strokeWidth={3} />}
          </TouchableOpacity>

          {/* Text */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: task.completed ? textMuted : textPrimary,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.text}
            </Text>

            {/* Meta row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: priorityColor + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: priorityColor, fontWeight: '600' }}>{PRIORITY_LABELS[task.priority]}</Text>
              </View>
              {task.energyCost && <EnergyBadge level={task.energyCost} />}
              {task.deadline && (
                <View style={{ backgroundColor: isOverdue ? '#ef444420' : '#3f3f5020', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, color: isOverdue ? '#ef4444' : textMuted }}>
                    {isOverdue ? '⚠️ ' : '📅 '}{task.deadline}
                  </Text>
                </View>
              )}
              {task.subtasks.length > 0 && (
                <Text style={{ fontSize: 10, color: textMuted }}>
                  {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} Subtasks
                </Text>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}>
                <Trash2 size={14} color={isDark ? '#6b7280' : '#9ca3af'} />
              </TouchableOpacity>
            )}
            {(showSubtasks && task.subtasks.length > 0) && (
              <View style={{ padding: 4 }}>
                {expanded ? <ChevronUp size={16} color={textMuted} /> : <ChevronDown size={16} color={textMuted} />}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Subtasks */}
      {expanded && showSubtasks && task.subtasks.length > 0 && (
        <View style={{ paddingLeft: 28, paddingRight: 12, paddingBottom: 10 }}>
          {task.subtasks.map((sub) => (
            <View key={sub.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderTopWidth: 1, borderTopColor: isDark ? '#2a2a3e' : '#f0f0f5' }}>
              <View style={{
                width: 16, height: 16, borderRadius: 8,
                borderWidth: 1.5,
                borderColor: sub.completed ? accent : (isDark ? '#4a4a6e' : '#d1d5db'),
                backgroundColor: sub.completed ? accent : 'transparent',
                justifyContent: 'center', alignItems: 'center', marginRight: 8,
              }}>
                {sub.completed && <Check size={9} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={{ fontSize: 13, color: sub.completed ? textMuted : textPrimary, flex: 1, textDecorationLine: sub.completed ? 'line-through' : 'none' }} numberOfLines={1}>
                {sub.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
