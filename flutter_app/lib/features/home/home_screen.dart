import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../data/models/task.dart';
import '../../data/repositories/task_repository.dart';
import '../../data/repositories/stats_repository.dart';
import '../../domain/gamification/gamification_service.dart';
import '../../domain/gamification/streak_service.dart';
import '../../domain/scheduler/day_scheduler.dart';
import '../../shared/providers/settings_provider.dart';
import '../../shared/widgets/reward_toast.dart';
import '../../shared/widgets/micro_confetti.dart';
import 'widgets/next_task_card.dart';
import 'widgets/energy_block.dart';
import 'widgets/compassion_banner.dart';
import 'widgets/daily_challenge_card.dart';

/// Main home screen – shows today's energy blocks, the "Next Task" card,
/// energy check-in, and compassion mode.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsync = ref.watch(todayTasksProvider);
    final statsAsync = ref.watch(userStatsProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dopamind'),
        actions: [
          // Quick-add FAB equivalent
          IconButton(
            icon: const Icon(Icons.add),
            tooltip: 'Aufgabe hinzufügen',
            onPressed: () => _showQuickAdd(context, ref),
          ),
        ],
      ),
      body: tasksAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Fehler: $e')),
        data: (tasks) => statsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Fehler: $e')),
          data: (stats) {
            // Recalculate streak on home screen open
            final updatedStats =
                const StreakService().recalculate(stats);
            if (updatedStats.currentStreakDays != stats.currentStreakDays) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                ref
                    .read(statsRepositoryProvider)
                    .updateStats(updatedStats);
              });
            }

            final scheduled = const DayScheduler().schedule(
              tasks,
              dailyEnergy: stats.energyLevel ?? 'normal',
            );

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(todayTasksProvider);
                ref.invalidate(userStatsProvider);
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Compassion mode banner
                  if (stats.isCompassionModeActive)
                    CompassionBanner(stats: stats)
                        .animate()
                        .fadeIn(duration: 300.ms),

                  // Energy check-in
                  if (stats.needsEnergyCheckin)
                    _EnergyCheckin(
                      onSelect: (level) async {
                        final newStats = stats.copyWith(
                          energyLevel: level,
                          energyCheckDate: _dateStr(DateTime.now()),
                        );
                        await ref
                            .read(statsRepositoryProvider)
                            .updateStats(newStats);
                      },
                    ).animate().slideY(
                          begin: -0.2,
                          end: 0,
                          duration: 400.ms,
                          curve: Curves.easeOut,
                        ),

                  const SizedBox(height: 12),

                  // XP + Level bar
                  _StatsBar(stats: stats),

                  const SizedBox(height: 16),

                  // Next Task card
                  if (scheduled.nextTask != null)
                    NextTaskCard(
                      task: scheduled.nextTask!,
                      onComplete: () => _completeTask(
                        context,
                        ref,
                        scheduled.nextTask!,
                        stats,
                      ),
                    ).animate().fadeIn(duration: 300.ms),

                  const SizedBox(height: 16),

                  // Morning block
                  EnergyBlockWidget(
                    block: DayBlock.morning,
                    tasks: scheduled.morning,
                    onComplete: (t) => _completeTask(context, ref, t, stats),
                    onMoveToTomorrow: (t) => ref
                        .read(taskRepositoryProvider)
                        .moveToTomorrow(t.id),
                  ),

                  const SizedBox(height: 12),

                  // Afternoon block
                  EnergyBlockWidget(
                    block: DayBlock.afternoon,
                    tasks: scheduled.afternoon,
                    onComplete: (t) => _completeTask(context, ref, t, stats),
                    onMoveToTomorrow: (t) => ref
                        .read(taskRepositoryProvider)
                        .moveToTomorrow(t.id),
                  ),

                  const SizedBox(height: 12),

                  // Evening block
                  EnergyBlockWidget(
                    block: DayBlock.evening,
                    tasks: scheduled.evening,
                    onComplete: (t) => _completeTask(context, ref, t, stats),
                    onMoveToTomorrow: (t) => ref
                        .read(taskRepositoryProvider)
                        .moveToTomorrow(t.id),
                  ),

                  const SizedBox(height: 80), // FAB space
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showQuickAdd(context, ref),
        tooltip: 'Aufgabe hinzufügen',
        child: const Icon(Icons.add),
      ),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  Future<void> _completeTask(
    BuildContext context,
    WidgetRef ref,
    Task task,
    dynamic stats,
  ) async {
    final taskRepo = ref.read(taskRepositoryProvider);
    final statsRepo = ref.read(statsRepositoryProvider);

    await taskRepo.completeTask(task.id);

    // Update stats & gamification
    final currentStats = await statsRepo.getStats();
    final streakUpdated =
        const StreakService().onTaskCompleted(currentStats);
    final gamified = GamificationService()
        .applyTaskCompletion(task, streakUpdated);
    await statsRepo.updateStats(gamified);

    final xpGained = GamificationService.calculateXpForTask(task, currentStats);

    if (context.mounted) {
      RewardToast.show(
        context,
        message: 'Aufgabe erledigt!',
        xp: xpGained,
      );
      final settings = ref.read(settingsProvider);
      if (settings.confettiEnabled) {
        MicroConfetti.show(context);
      }
    }
  }

  Future<void> _showQuickAdd(BuildContext context, WidgetRef ref) async {
    final textCtrl = TextEditingController();
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _QuickAddSheet(
        controller: textCtrl,
        onAdd: (text) async {
          if (text.trim().isEmpty) return;
          final today = _dateStr(DateTime.now());
          await ref.read(taskRepositoryProvider).createTask(
                Task(
                  id: '',
                  text: text.trim(),
                  scheduledDate: today,
                ),
              );
        },
      ),
    );
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

// ── Inline widgets ────────────────────────────────────────────────────────

class _StatsBar extends StatelessWidget {
  const _StatsBar({required this.stats});

  final dynamic stats;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final level = stats.level as int;
    final xp = stats.xp as int;
    final nextXp = GamificationService.xpToNextLevel(level);
    final currXp = GamificationService.xpRequiredForLevel(level);
    final progress =
        nextXp == currXp ? 1.0 : (xp - currXp) / (nextXp - currXp);

    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: dc.accent,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            '$level',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    GamificationService.getLevelTitle(level),
                    style: TextStyle(
                      color: dc.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    '$xp XP',
                    style: TextStyle(color: dc.textSecondary, fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: progress.clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: dc.muted.withOpacity(0.3),
                  valueColor: AlwaysStoppedAnimation<Color>(dc.accent),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Column(
          children: [
            Icon(Icons.local_fire_department,
                color: dc.warn, size: 20),
            Text(
              '${stats.currentStreakDays}',
              style: TextStyle(
                  color: dc.warn,
                  fontWeight: FontWeight.bold,
                  fontSize: 12),
            ),
          ],
        ),
      ],
    );
  }
}

class _EnergyCheckin extends StatelessWidget {
  const _EnergyCheckin({required this.onSelect});

  final void Function(String) onSelect;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Wie ist deine Energie heute?',
              style: TextStyle(
                  color: dc.textPrimary, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _energyBtn(context, 'low', '😴 Niedrig', dc.muted),
                const SizedBox(width: 8),
                _energyBtn(context, 'normal', '😊 Normal', dc.success),
                const SizedBox(width: 8),
                _energyBtn(context, 'high', '⚡ Hoch', dc.warn),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _energyBtn(
      BuildContext context, String value, String label, Color color) {
    return Expanded(
      child: OutlinedButton(
        onPressed: () => onSelect(value),
        style: OutlinedButton.styleFrom(
          side: BorderSide(color: color),
          foregroundColor: color,
        ),
        child: Text(label, style: const TextStyle(fontSize: 12)),
      ),
    );
  }
}

class _QuickAddSheet extends StatelessWidget {
  const _QuickAddSheet({
    required this.controller,
    required this.onAdd,
  });

  final TextEditingController controller;
  final void Function(String) onAdd;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      decoration: BoxDecoration(
        color: dc.card,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Was möchtest du heute erledigen?',
                border: InputBorder.none,
              ),
              onSubmitted: (v) {
                onAdd(v);
                Navigator.pop(context);
              },
            ),
          ),
          IconButton(
            icon: Icon(Icons.send, color: dc.accent),
            onPressed: () {
              onAdd(controller.text);
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}
