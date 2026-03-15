import 'package:enough_mail/enough_mail.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// A single row in the mail list.
class MailListItem extends StatelessWidget {
  const MailListItem({
    super.key,
    required this.message,
    required this.onTap,
  });

  final MimeMessage message;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final from = message.from?.first;
    final fromDisplay =
        from?.personalName ?? from?.email ?? 'Unbekannt';
    final subject = message.decodeSubject() ?? '(Kein Betreff)';
    final date = message.decodeDate();
    final isRead = message.isSeen;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
            horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Unread dot
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(
                color: isRead
                    ? Colors.transparent
                    : dc.accent,
                shape: BoxShape.circle,
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        fromDisplay,
                        style: TextStyle(
                          color: dc.textPrimary,
                          fontWeight: isRead
                              ? FontWeight.normal
                              : FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      if (date != null)
                        Text(
                          _formatDate(date),
                          style: TextStyle(
                            color: dc.muted,
                            fontSize: 11,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subject,
                    style: TextStyle(
                      color: isRead ? dc.textSecondary : dc.textPrimary,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _formatDate(DateTime d) {
    final now = DateTime.now();
    if (d.year == now.year &&
        d.month == now.month &&
        d.day == now.day) {
      return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    }
    return '${d.day}.${d.month}.';
  }
}
