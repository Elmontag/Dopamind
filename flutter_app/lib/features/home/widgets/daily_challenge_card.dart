import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Placeholder daily challenge card (can be extended with real challenge data).
class DailyChallengeCard extends StatelessWidget {
  const DailyChallengeCard({super.key, this.challenge});

  final String? challenge;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: dc.warn.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.emoji_events, color: dc.warn),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Tages-Challenge',
                    style: TextStyle(
                      color: dc.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    challenge ?? '3 Aufgaben heute erledigen',
                    style: TextStyle(
                      color: dc.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
