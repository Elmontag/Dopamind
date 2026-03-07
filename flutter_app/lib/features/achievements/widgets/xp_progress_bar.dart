import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_stats.dart';
import '../../../domain/gamification/gamification_service.dart';

/// XP progress bar card.
class XpProgressBar extends StatelessWidget {
  const XpProgressBar({super.key, required this.stats});

  final UserStats stats;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final level = stats.level;
    final xp = stats.xp;
    final currXp = GamificationService.xpRequiredForLevel(level);
    final nextXp = GamificationService.xpToNextLevel(level);
    final progress =
        nextXp == currXp ? 1.0 : (xp - currXp) / (nextXp - currXp);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [dc.accent, dc.accentSoft],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '$level',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 20,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          GamificationService.getLevelTitle(level),
                          style: TextStyle(
                            color: dc.textPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          '$xp XP gesamt',
                          style: TextStyle(
                            color: dc.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  'Level ${level + 1}',
                  style: TextStyle(color: dc.muted, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                minHeight: 8,
                backgroundColor: dc.muted.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(dc.accent),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${xp - currXp} / ${nextXp - currXp} XP',
              style: TextStyle(color: dc.textSecondary, fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }
}
