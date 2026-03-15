import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';

/// Displays a 7-day summary view of tasks.
class WeekSummaryView extends StatefulWidget {
  const WeekSummaryView({super.key, required this.tasks});

  final List<Task> tasks;

  @override
  State<WeekSummaryView> createState() => _WeekSummaryViewState();
}

class _WeekSummaryViewState extends State<WeekSummaryView> {
  late DateTime _weekStart;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    // Start on Monday
    _weekStart = now.subtract(Duration(days: (now.weekday - 1)));
    _weekStart = DateTime(_weekStart.year, _weekStart.month, _weekStart.day);
  }

  List<DateTime> get _days =>
      List.generate(7, (i) => _weekStart.add(Duration(days: i)));

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;

    return Column(
      children: [
        // Week navigation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () => setState(
                  () => _weekStart =
                      _weekStart.subtract(const Duration(days: 7)),
                ),
              ),
              Expanded(
                child: Text(
                  _weekLabel(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: dc.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () => setState(
                  () => _weekStart =
                      _weekStart.add(const Duration(days: 7)),
                ),
              ),
            ],
          ),
        ),

        // Day columns header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: _days.map((day) {
              final isToday = _isToday(day);
              return Expanded(
                child: Column(
                  children: [
                    Text(
                      _shortDay(day.weekday),
                      style: TextStyle(
                        color: dc.textSecondary,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: isToday
                            ? dc.accent
                            : Colors.transparent,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${day.day}',
                        style: TextStyle(
                          color: isToday ? Colors.white : dc.textPrimary,
                          fontWeight: isToday
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        const Divider(height: 1),

        // Task counts per day (heatmap-like)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: _days.map((day) {
              final dateStr = _dateStr(day);
              final dayTasks = widget.tasks
                  .where((t) => t.scheduledDate == dateStr)
                  .toList();
              final completed =
                  dayTasks.where((t) => t.completed).length;
              final total = dayTasks.length;
              return Expanded(
                child: _DayCell(
                  date: day,
                  completed: completed,
                  total: total,
                  dc: dc,
                ),
              );
            }).toList(),
          ),
        ),

        // Tasks for selected day
        Expanded(
          child: _TasksForWeek(
            days: _days,
            tasks: widget.tasks,
          ),
        ),
      ],
    );
  }

  String _weekLabel() {
    final end = _weekStart.add(const Duration(days: 6));
    return '${_weekStart.day}.${_weekStart.month}. – ${end.day}.${end.month}.${end.year}';
  }

  static bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  static String _shortDay(int weekday) {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return days[weekday - 1];
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.date,
    required this.completed,
    required this.total,
    required this.dc,
  });

  final DateTime date;
  final int completed;
  final int total;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    final ratio = total == 0 ? 0.0 : completed / total;
    final color = ratio == 1.0
        ? dc.success
        : ratio > 0.5
            ? dc.accent
            : total > 0
                ? dc.warn
                : dc.muted.withOpacity(0.2);
    return Column(
      children: [
        Container(
          height: 6,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        if (total > 0)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              '$completed/$total',
              style: TextStyle(color: dc.muted, fontSize: 9),
            ),
          ),
      ],
    );
  }
}

class _TasksForWeek extends StatelessWidget {
  const _TasksForWeek({required this.days, required this.tasks});

  final List<DateTime> days;
  final List<Task> tasks;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: days.map((day) {
        final dateStr =
            '${day.year}-${day.month.toString().padLeft(2, '0')}-${day.day.toString().padLeft(2, '0')}';
        final dayTasks = tasks
            .where((t) => t.scheduledDate == dateStr)
            .toList();
        if (dayTasks.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                '${day.day}.${day.month}.',
                style: TextStyle(
                  color: dc.textSecondary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
            ...dayTasks.map((t) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(
                        t.completed
                            ? Icons.check_circle
                            : Icons.circle_outlined,
                        size: 14,
                        color: t.completed ? dc.success : dc.muted,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          t.text,
                          style: TextStyle(
                            color: t.completed
                                ? dc.muted
                                : dc.textPrimary,
                            fontSize: 13,
                            decoration: t.completed
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        );
      }).toList(),
    );
  }
}
