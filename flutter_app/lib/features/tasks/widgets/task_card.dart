import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';

/// Collapsed/expanded task card for the tasks list.
class TaskCard extends StatefulWidget {
  const TaskCard({
    super.key,
    required this.task,
    this.onComplete,
    this.onReopen,
    this.onEdit,
    this.onDelete,
  });

  final Task task;
  final VoidCallback? onComplete;
  final VoidCallback? onReopen;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  @override
  State<TaskCard> createState() => _TaskCardState();
}

class _TaskCardState extends State<TaskCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final task = widget.task;
    final priorityColor = AppColors.priorityColor(task.priority);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        children: [
          // ── Collapsed row ────────────────────────────────────────────────
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border(
                  left: BorderSide(
                    color: priorityColor,
                    width: 3,
                  ),
                ),
              ),
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  // Completion checkbox
                  GestureDetector(
                    onTap: task.completed
                        ? widget.onReopen
                        : widget.onComplete,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: task.completed
                            ? dc.success
                            : Colors.transparent,
                        border: Border.all(
                          color: task.completed
                              ? dc.success
                              : dc.muted,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: task.completed
                          ? const Icon(Icons.check,
                              size: 14, color: Colors.white)
                          : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Task text
                  Expanded(
                    child: Text(
                      task.text,
                      style: TextStyle(
                        color: task.completed
                            ? dc.muted
                            : dc.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        decoration: task.completed
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Deadline badge
                  if (task.deadline != null)
                    _DeadlineBadge(task: task, dc: dc),
                  // Subtask count
                  if (task.subtasks.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: Text(
                        '${task.subtasks.length}',
                        style: TextStyle(
                          color: dc.muted,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  // Expand arrow
                  Icon(
                    _expanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: dc.muted,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),

          // ── Expanded details ─────────────────────────────────────────────
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Divider(height: 16),
                  // Metadata row
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      if (task.energyCost != null)
                        _MetaChip(
                            label: _energyLabel(task.energyCost),
                            color: dc.success),
                      if (task.scheduledTime != null)
                        _MetaChip(
                            label: _timeLabel(task.scheduledTime!),
                            color: dc.accentSoft),
                      if (task.estimatedMinutes != null)
                        _MetaChip(
                            label: '${task.estimatedMinutes} min',
                            color: dc.muted),
                      ...task.tags.map(
                        (tag) => _MetaChip(label: '#$tag', color: dc.accent),
                      ),
                    ],
                  ),
                  // Actions
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (widget.onEdit != null)
                        TextButton.icon(
                          onPressed: widget.onEdit,
                          icon: const Icon(Icons.edit, size: 14),
                          label: const Text('Bearbeiten'),
                        ),
                      if (widget.onDelete != null)
                        TextButton.icon(
                          onPressed: widget.onDelete,
                          icon: Icon(Icons.delete,
                              size: 14, color: dc.danger),
                          label: Text('Löschen',
                              style: TextStyle(color: dc.danger)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  static String _energyLabel(String energy) {
    switch (energy) {
      case 'high':
        return '⚡ Hohe Energie';
      case 'low':
        return '😴 Niedrig';
      default:
        return '😊 Normal';
    }
  }

  static String _timeLabel(String time) {
    switch (time) {
      case 'morning':
        return '☀️ Morgens';
      case 'afternoon':
        return '☁️ Mittags';
      case 'evening':
        return '🌙 Abends';
      default:
        return '⏱ Genau';
    }
  }
}

class _DeadlineBadge extends StatelessWidget {
  const _DeadlineBadge({required this.task, required this.dc});

  final Task task;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    final color = task.isOverdue
        ? dc.danger
        : task.isDueSoon
            ? dc.warn
            : dc.muted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        task.deadline!,
        style: TextStyle(color: color, fontSize: 11),
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12),
      ),
    );
  }
}
