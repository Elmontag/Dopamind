import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/subtask.dart';

/// A single subtask row with toggle and delete.
class SubtaskItem extends StatelessWidget {
  const SubtaskItem({
    super.key,
    required this.subtask,
    required this.onToggle,
    required this.onDelete,
  });

  final Subtask subtask;
  final VoidCallback onToggle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Row(
      children: [
        GestureDetector(
          onTap: onToggle,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: subtask.completed ? dc.success : Colors.transparent,
              border: Border.all(
                color: subtask.completed ? dc.success : dc.muted,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(5),
            ),
            child: subtask.completed
                ? const Icon(Icons.check, size: 13, color: Colors.white)
                : null,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            subtask.text,
            style: TextStyle(
              color: subtask.completed ? dc.muted : dc.textPrimary,
              fontSize: 13,
              decoration: subtask.completed
                  ? TextDecoration.lineThrough
                  : null,
            ),
          ),
        ),
        IconButton(
          icon: Icon(Icons.close, size: 16, color: dc.muted),
          onPressed: onDelete,
          visualDensity: VisualDensity.compact,
        ),
      ],
    );
  }
}
