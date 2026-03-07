import 'package:enough_mail/enough_mail.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Full-page mail detail view.
class MailDetailView extends StatelessWidget {
  const MailDetailView({
    super.key,
    required this.message,
    required this.onBack,
    required this.onConvertToTask,
  });

  final MimeMessage message;
  final VoidCallback onBack;
  final Future<void> Function(MimeMessage) onConvertToTask;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final subject = message.decodeSubject() ?? '(Kein Betreff)';
    final from = message.from?.first;
    final fromDisplay =
        from?.personalName ?? from?.email ?? 'Unbekannt';
    final date = message.decodeDate();
    final body = message.decodeTextPlainPart() ??
        message.decodeTextHtmlPart() ??
        '(Kein Inhalt)';

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: onBack,
        ),
        title: Text(
          subject,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.task_alt),
            tooltip: 'Als Aufgabe speichern',
            onPressed: () => onConvertToTask(message),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // From / date
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fromDisplay,
                        style: TextStyle(
                          color: dc.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (from?.email != null &&
                          from?.personalName != null)
                        Text(
                          from!.email,
                          style: TextStyle(
                              color: dc.textSecondary, fontSize: 12),
                        ),
                    ],
                  ),
                ),
                if (date != null)
                  Text(
                    _formatDate(date),
                    style:
                        TextStyle(color: dc.muted, fontSize: 12),
                  ),
              ],
            ),
            const Divider(height: 24),
            // Body
            SelectableText(
              body,
              style: TextStyle(
                color: dc.textPrimary,
                fontSize: 14,
                height: 1.6,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _formatDate(DateTime d) {
    return '${d.day.toString().padLeft(2, '0')}.${d.month.toString().padLeft(2, '0')}.${d.year} '
        '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }
}
