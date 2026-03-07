import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';

/// Month grid view showing task counts per day.
class MonthPlanView extends StatefulWidget {
  const MonthPlanView({super.key, required this.tasks});

  final List<Task> tasks;

  @override
  State<MonthPlanView> createState() => _MonthPlanViewState();
}

class _MonthPlanViewState extends State<MonthPlanView> {
  late DateTime _month;
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
    _selectedDay = DateTime(now.year, now.month, now.day);
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final daysInMonth = DateUtils.getDaysInMonth(_month.year, _month.month);
    final firstWeekday = DateTime(_month.year, _month.month, 1).weekday;

    // Tasks for selected day
    final selectedTasks = _selectedDay == null
        ? <Task>[]
        : widget.tasks
            .where((t) => t.scheduledDate == _dateStr(_selectedDay!))
            .toList();

    return Column(
      children: [
        // Month navigation
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () => setState(
                  () => _month = DateTime(
                      _month.year, _month.month - 1),
                ),
              ),
              Expanded(
                child: Text(
                  _monthLabel(),
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
                  () => _month = DateTime(
                      _month.year, _month.month + 1),
                ),
              ),
            ],
          ),
        ),

        // Day-of-week header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
                .map((d) => Expanded(
                      child: Text(
                        d,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: dc.textSecondary,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 4),

        // Day grid
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              mainAxisSpacing: 4,
              crossAxisSpacing: 4,
              childAspectRatio: 1,
            ),
            itemCount: (firstWeekday - 1) + daysInMonth,
            itemBuilder: (ctx, i) {
              if (i < firstWeekday - 1) return const SizedBox();
              final day = i - (firstWeekday - 2);
              final date = DateTime(_month.year, _month.month, day);
              final dateStr = _dateStr(date);
              final count = widget.tasks
                  .where((t) => t.scheduledDate == dateStr)
                  .length;
              final completedCount = widget.tasks
                  .where((t) =>
                      t.scheduledDate == dateStr && t.completed)
                  .length;
              final isToday = _isToday(date);
              final isSelected = _selectedDay != null &&
                  _dateStr(_selectedDay!) == dateStr;

              return GestureDetector(
                onTap: () =>
                    setState(() => _selectedDay = date),
                child: _DayTile(
                  day: day,
                  count: count,
                  completedCount: completedCount,
                  isToday: isToday,
                  isSelected: isSelected,
                  dc: dc,
                ),
              );
            },
          ),
        ),

        const Divider(height: 16),

        // Tasks for selected day
        Expanded(
          child: selectedTasks.isEmpty
              ? Center(
                  child: Text(
                    'Keine Aufgaben',
                    style: TextStyle(color: dc.muted),
                  ),
                )
              : ListView(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16),
                  children: selectedTasks
                      .map(
                        (t) => ListTile(
                          leading: Icon(
                            t.completed
                                ? Icons.check_circle
                                : Icons.circle_outlined,
                            color: t.completed
                                ? dc.success
                                : dc.muted,
                          ),
                          title: Text(
                            t.text,
                            style: TextStyle(
                              color: t.completed
                                  ? dc.muted
                                  : dc.textPrimary,
                              decoration: t.completed
                                  ? TextDecoration.lineThrough
                                  : null,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
        ),
      ],
    );
  }

  String _monthLabel() {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ];
    return '${months[_month.month - 1]} ${_month.year}';
  }

  static bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

class _DayTile extends StatelessWidget {
  const _DayTile({
    required this.day,
    required this.count,
    required this.completedCount,
    required this.isToday,
    required this.isSelected,
    required this.dc,
  });

  final int day;
  final int count;
  final int completedCount;
  final bool isToday;
  final bool isSelected;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    final allDone = count > 0 && completedCount == count;
    return Container(
      decoration: BoxDecoration(
        color: isSelected
            ? dc.accent.withOpacity(0.25)
            : isToday
                ? dc.accent.withOpacity(0.1)
                : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isSelected
              ? dc.accent
              : isToday
                  ? dc.accent.withOpacity(0.4)
                  : Colors.transparent,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '$day',
            style: TextStyle(
              color: isToday ? dc.accent : dc.textPrimary,
              fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            ),
          ),
          if (count > 0)
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                color: allDone ? dc.success : dc.warn,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}
