import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';
import '../../../domain/scheduler/day_scheduler.dart';

/// A collapsible energy block (Morning / Afternoon / Evening).
class EnergyBlockWidget extends StatefulWidget {
  const EnergyBlockWidget({
    super.key,
    required this.block,
    required this.tasks,
    required this.onComplete,
    required this.onMoveToTomorrow,
  });

  final DayBlock block;
  final List<Task> tasks;
  final void Function(Task) onComplete;
  final void Function(Task) onMoveToTomorrow;

  @override
  State<EnergyBlockWidget> createState() => _EnergyBlockWidgetState();
}

class _EnergyBlockWidgetState extends State<EnergyBlockWidget> {
  bool _expanded = true;

  @override
  void initState() {
    super.initState();
    // Collapse afternoon/evening blocks by default
    _expanded = widget.block == DayBlock.morning;
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final blockColor = _blockColor(dc);
    final blockIcon = _blockIcon();
    final blockLabel = _blockLabel();

    return Card(
      child: Column(
        children: [
          // Header
          InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Icon(blockIcon, color: blockColor, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    blockLabel,
                    style: TextStyle(
                      color: dc.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: blockColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      '${widget.tasks.length}',
                      style: TextStyle(
                        color: blockColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    _expanded
                        ? Icons.keyboard_arrow_up
                        : Icons.keyboard_arrow_down,
                    color: dc.muted,
                  ),
                ],
              ),
            ),
          ),

          // Tasks
          if (_expanded && widget.tasks.isNotEmpty)
            ...widget.tasks.map((task) => _TaskRow(
                  task: task,
                  blockColor: blockColor,
                  onComplete: () => widget.onComplete(task),
                  onMoveToTomorrow: () =>
                      widget.onMoveToTomorrow(task),
                )),

          if (_expanded && widget.tasks.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 12),
              child: Text(
                'Keine Aufgaben',
                style: TextStyle(
                    color: dc.muted, fontSize: 13),
              ),
            ),
        ],
      ),
    );
  }

  Color _blockColor(DopamindColors dc) {
    switch (widget.block) {
      case DayBlock.morning:
        return dc.warn;
      case DayBlock.afternoon:
        return dc.accent;
      case DayBlock.evening:
        return dc.accentGlow;
    }
  }

  IconData _blockIcon() {
    switch (widget.block) {
      case DayBlock.morning:
        return Icons.wb_sunny_outlined;
      case DayBlock.afternoon:
        return Icons.wb_cloudy_outlined;
      case DayBlock.evening:
        return Icons.nightlight_outlined;
    }
  }

  String _blockLabel() {
    switch (widget.block) {
      case DayBlock.morning:
        return 'Morgen';
      case DayBlock.afternoon:
        return 'Mittag';
      case DayBlock.evening:
        return 'Abend';
    }
  }
}

class _TaskRow extends StatelessWidget {
  const _TaskRow({
    required this.task,
    required this.blockColor,
    required this.onComplete,
    required this.onMoveToTomorrow,
  });

  final Task task;
  final Color blockColor;
  final VoidCallback onComplete;
  final VoidCallback onMoveToTomorrow;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          // Priority dot
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              color: _priorityColor(dc),
              shape: BoxShape.circle,
            ),
          ),
          // Text
          Expanded(
            child: Text(
              task.text,
              style: TextStyle(
                color: dc.textPrimary,
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Move to tomorrow
          IconButton(
            icon: Icon(Icons.arrow_forward,
                size: 16, color: dc.muted),
            tooltip: 'Auf morgen verschieben',
            onPressed: onMoveToTomorrow,
            visualDensity: VisualDensity.compact,
          ),
          // Complete
          GestureDetector(
            onTap: onComplete,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                border: Border.all(color: dc.muted, width: 1.5),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(Icons.check, size: 16, color: Colors.transparent),
            ),
          ),
        ],
      ),
    );
  }

  Color _priorityColor(DopamindColors dc) {
    switch (task.priority) {
      case 'high':
        return dc.danger;
      case 'low':
        return dc.muted;
      default:
        return dc.warn;
    }
  }
}
