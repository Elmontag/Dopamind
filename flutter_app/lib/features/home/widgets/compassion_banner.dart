import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/user_stats.dart';

/// Banner shown when compassion mode (Not my day) is active.
class CompassionBanner extends StatelessWidget {
  const CompassionBanner({super.key, required this.stats});

  final UserStats stats;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: dc.accentSoft.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: dc.accentSoft.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Text('💙', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Nicht mein Tag',
                  style: TextStyle(
                    color: dc.accentSoft,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'XP-Streak-Strafe unterdrückt',
                  style: TextStyle(
                    color: dc.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
