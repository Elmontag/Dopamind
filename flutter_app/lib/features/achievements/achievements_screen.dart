import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../data/repositories/stats_repository.dart';
import '../../domain/gamification/gamification_service.dart';
import '../../domain/gamification/achievement_definitions.dart';
import 'widgets/xp_progress_bar.dart';
import 'widgets/achievement_badge.dart';
import 'widgets/stats_heatmap.dart';

/// Achievements & stats screen.
class AchievementsScreen extends ConsumerStatefulWidget {
  const AchievementsScreen({super.key});

  @override
  ConsumerState<AchievementsScreen> createState() =>
      _AchievementsScreenState();
}

class _AchievementsScreenState extends ConsumerState<AchievementsScreen> {
  String _filter = 'week'; // week | month | year

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final statsAsync = ref.watch(userStatsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Erfolge')),
      body: statsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Fehler: $e')),
        data: (stats) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // XP Progress bar
            XpProgressBar(stats: stats),
            const SizedBox(height: 16),

            // Streak card
            _StreakCard(stats: stats),
            const SizedBox(height: 16),

            // Stats summary
            _StatsSummary(stats: stats, filter: _filter,
                onFilterChange: (f) => setState(() => _filter = f)),
            const SizedBox(height: 16),

            // Heatmap
            StatsHeatmap(stats: stats),
            const SizedBox(height: 16),

            // Achievements
            Text(
              'Achievements',
              style: TextStyle(
                color: dc.textPrimary,
                fontWeight: FontWeight.w700,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 12),

            ...kAchievements.asMap().entries.map((e) {
              final achievement = e.value;
              final unlocked = stats.unlockedAchievements
                  .contains(achievement.id);
              return AchievementBadge(
                achievement: achievement,
                unlocked: unlocked,
              )
                  .animate()
                  .fadeIn(
                    duration: 200.ms,
                    delay: (e.key * 30).ms,
                  )
                  .slideX(begin: -0.05, end: 0);
            }),

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _StreakCard extends StatelessWidget {
  const _StreakCard({required this.stats});

  final dynamic stats;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.local_fire_department, color: dc.warn, size: 36),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${stats.currentStreakDays} Tage Streak',
                  style: TextStyle(
                    color: dc.textPrimary,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                Text(
                  'Beste: ${stats.longestStreak} Tage',
                  style: TextStyle(color: dc.textSecondary, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsSummary extends StatelessWidget {
  const _StatsSummary({
    required this.stats,
    required this.filter,
    required this.onFilterChange,
  });

  final dynamic stats;
  final String filter;
  final void Function(String) onFilterChange;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final count = filter == 'month'
        ? stats.completedThisMonth
        : filter == 'year'
            ? stats.completedThisYear
            : stats.completedThisWeek;
    final label = filter == 'month'
        ? 'diesen Monat'
        : filter == 'year'
            ? 'dieses Jahr'
            : 'diese Woche';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Filter chips
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _FilterChip(
                    label: 'Woche',
                    value: 'week',
                    selected: filter == 'week',
                    dc: dc,
                    onTap: () => onFilterChange('week')),
                const SizedBox(width: 8),
                _FilterChip(
                    label: 'Monat',
                    value: 'month',
                    selected: filter == 'month',
                    dc: dc,
                    onTap: () => onFilterChange('month')),
                const SizedBox(width: 8),
                _FilterChip(
                    label: 'Jahr',
                    value: 'year',
                    selected: filter == 'year',
                    dc: dc,
                    onTap: () => onFilterChange('year')),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _StatItem(
                    label: 'Erledigt $label',
                    value: '$count',
                    dc: dc),
                _StatItem(
                    label: 'Fokuszeit gesamt',
                    value: '${stats.totalFocusMinutes ~/ 60}h',
                    dc: dc),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem(
      {required this.label, required this.value, required this.dc});

  final String label;
  final String value;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: TextStyle(
                color: dc.accent,
                fontWeight: FontWeight.bold,
                fontSize: 24)),
        Text(label,
            style: TextStyle(color: dc.textSecondary, fontSize: 12)),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.dc,
    required this.onTap,
  });

  final String label;
  final String value;
  final bool selected;
  final DopamindColors dc;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? dc.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: selected ? dc.accent : dc.muted.withOpacity(0.5)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : dc.textSecondary,
            fontSize: 12,
            fontWeight:
                selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
