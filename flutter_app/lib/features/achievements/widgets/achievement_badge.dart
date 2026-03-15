import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../domain/gamification/achievement_definitions.dart';

/// Achievement badge card – locked or unlocked.
class AchievementBadge extends StatelessWidget {
  const AchievementBadge({
    super.key,
    required this.achievement,
    required this.unlocked,
  });

  final AchievementDefinition achievement;
  final bool unlocked;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final color = unlocked ? _sizeColor(achievement.size, dc) : dc.muted;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: unlocked
              ? color.withOpacity(0.1)
              : dc.card.withOpacity(0.5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: unlocked
                ? color.withOpacity(0.3)
                : dc.muted.withOpacity(0.2),
          ),
        ),
        child: Row(
          children: [
            // Icon / badge
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                unlocked ? Icons.emoji_events : Icons.lock_outline,
                color: color,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            // Title & description
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    achievement.titleDe,
                    style: TextStyle(
                      color: unlocked ? dc.textPrimary : dc.muted,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    achievement.descDe,
                    style: TextStyle(
                      color: dc.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            // XP badge
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '+${achievement.xp} XP',
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Color _sizeColor(String size, DopamindColors dc) {
    switch (size) {
      case 'large':
        return dc.warn;
      case 'medium':
        return dc.accent;
      default:
        return dc.success;
    }
  }
}
