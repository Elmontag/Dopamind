import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';
import '../../../shared/widgets/glass_card.dart';

/// The prominent "Next Task" card shown at the top of the home screen.
class NextTaskCard extends StatelessWidget {
  const NextTaskCard({
    super.key,
    required this.task,
    required this.onComplete,
  });

  final Task task;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: dc.accent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt, color: dc.accent, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      'Nächste Aufgabe',
                      style: TextStyle(
                        color: dc.accent,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              _PriorityChip(priority: task.priority),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            task.text,
            style: TextStyle(
              color: dc.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (task.estimatedMinutes != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(Icons.timer_outlined,
                    size: 14, color: dc.textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${task.estimatedMinutes} min',
                  style:
                      TextStyle(color: dc.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ],
          if (task.deadline != null && (task.isOverdue || task.isDueSoon)) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(
                  Icons.warning_amber_rounded,
                  size: 14,
                  color: task.isOverdue ? dc.danger : dc.warn,
                ),
                const SizedBox(width: 4),
                Text(
                  task.isOverdue ? 'Überfällig' : 'Bald fällig',
                  style: TextStyle(
                    color: task.isOverdue ? dc.danger : dc.warn,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onComplete,
              icon: const Icon(Icons.check, size: 18),
              label: const Text('Erledigt'),
              style: ElevatedButton.styleFrom(
                backgroundColor: dc.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().scale(
          begin: const Offset(0.97, 0.97),
          end: const Offset(1, 1),
          duration: 400.ms,
          curve: const Cubic(0.68, -0.55, 0.265, 1.55),
        );
  }
}

class _PriorityChip extends StatelessWidget {
  const _PriorityChip({required this.priority});

  final String priority;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    Color color;
    String label;
    switch (priority) {
      case 'high':
        color = dc.danger;
        label = 'Muss sein';
        break;
      case 'low':
        color = dc.muted;
        label = 'Wäre schön';
        break;
      default:
        color = dc.warn;
        label = 'Wichtig';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
