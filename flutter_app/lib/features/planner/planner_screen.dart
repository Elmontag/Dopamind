import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../data/repositories/task_repository.dart';
import '../../data/repositories/calendar_repository.dart';
import '../../shared/providers/settings_provider.dart';
import 'widgets/week_summary_view.dart';
import 'widgets/month_plan_view.dart';

/// Planner screen with week/month toggle.
class PlannerScreen extends ConsumerStatefulWidget {
  const PlannerScreen({super.key});

  @override
  ConsumerState<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends ConsumerState<PlannerScreen> {
  bool _showMonth = false;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final tasksAsync = ref.watch(allTasksProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Planer'),
        actions: [
          // Toggle week/month
          IconButton(
            icon: Icon(
              _showMonth ? Icons.view_week : Icons.calendar_month,
              color: dc.accent,
            ),
            tooltip: _showMonth ? 'Woche' : 'Monat',
            onPressed: () => setState(() => _showMonth = !_showMonth),
          ),
        ],
      ),
      body: tasksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Fehler: $e')),
        data: (tasks) => _showMonth
            ? MonthPlanView(tasks: tasks)
            : WeekSummaryView(tasks: tasks),
      ),
    );
  }
}
