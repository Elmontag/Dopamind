import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_stats.dart';

/// Heatmap-like weekly completion view.
class StatsHeatmap extends StatelessWidget {
  const StatsHeatmap({super.key, required this.stats});

  final UserStats stats;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;

    // Build last 7 weeks × 7 days heatmap
    final now = DateTime.now();
    final cells = <DateTime>[];
    // Start from 7 weeks ago (Monday)
    var start = now.subtract(Duration(days: now.weekday - 1 + 6 * 7));
    start = DateTime(start.year, start.month, start.day);
    for (var i = 0; i < 49; i++) {
      cells.add(start.add(Duration(days: i)));
    }

    // For now, colour by completedToday as a placeholder
    // (A real implementation would need daily history stored separately)
    final today = _dateStr(now);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Aktivität (letzte 7 Wochen)',
              style: TextStyle(
                color: dc.textPrimary,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                mainAxisSpacing: 3,
                crossAxisSpacing: 3,
                childAspectRatio: 1,
              ),
              itemCount: cells.length,
              itemBuilder: (_, i) {
                final cell = cells[i];
                final cellStr = _dateStr(cell);
                final isToday = cellStr == today;
                return Container(
                  decoration: BoxDecoration(
                    color: isToday
                        ? dc.accent
                        : dc.muted.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(3),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}
