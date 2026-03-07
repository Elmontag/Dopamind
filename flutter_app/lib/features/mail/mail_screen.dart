import 'package:enough_mail/enough_mail.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../data/repositories/mail_repository.dart';
import '../../data/repositories/task_repository.dart';
import '../../data/models/task.dart';
import '../../shared/providers/settings_provider.dart';
import 'widgets/mail_list_item.dart';
import 'widgets/mail_detail_view.dart';

/// Mail screen – shows IMAP inbox if credentials are configured.
class MailScreen extends ConsumerStatefulWidget {
  const MailScreen({super.key});

  @override
  ConsumerState<MailScreen> createState() => _MailScreenState();
}

class _MailScreenState extends ConsumerState<MailScreen> {
  bool _loading = false;
  bool _connected = false;
  String? _error;
  List<MimeMessage> _messages = [];
  MimeMessage? _selected;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _tryConnect());
  }

  Future<void> _tryConnect() async {
    final repo = ref.read(mailRepositoryProvider);
    final creds = await repo.loadCredentials();
    if (creds == null || !creds.isConfigured) {
      setState(() => _connected = false);
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await repo.connect(creds);
      final msgs = await repo.fetchMails();
      if (mounted) {
        setState(() {
          _connected = true;
          _messages = msgs;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;

    if (_selected != null) {
      return MailDetailView(
        message: _selected!,
        onBack: () => setState(() => _selected = null),
        onConvertToTask: _convertToTask,
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mail'),
        actions: [
          if (_connected)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _tryConnect,
            ),
        ],
      ),
      body: _buildBody(dc),
    );
  }

  Widget _buildBody(DopamindColors dc) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.error_outline, size: 48, color: dc.danger),
              const SizedBox(height: 16),
              Text(
                'Fehler: $_error',
                textAlign: TextAlign.center,
                style: TextStyle(color: dc.danger),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _tryConnect,
                child: const Text('Erneut versuchen'),
              ),
            ],
          ),
        ),
      );
    }

    if (!_connected) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.mail_outline, size: 64, color: dc.muted),
              const SizedBox(height: 16),
              Text(
                'Keine IMAP-Verbindung konfiguriert',
                style: TextStyle(
                  color: dc.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Konfiguriere dein IMAP-Konto in den Einstellungen.',
                style: TextStyle(color: dc.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () =>
                    // Navigate to settings – simplified
                    ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content:
                        Text('Öffne Einstellungen → IMAP'),
                  ),
                ),
                icon: const Icon(Icons.settings),
                label: const Text('IMAP konfigurieren'),
              ),
            ],
          ),
        ),
      );
    }

    if (_messages.isEmpty) {
      return Center(
        child: Text(
          'Keine Nachrichten',
          style: TextStyle(color: dc.muted),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _tryConnect,
      child: ListView.builder(
        itemCount: _messages.length,
        itemBuilder: (ctx, i) => MailListItem(
          message: _messages[i],
          onTap: () => setState(() => _selected = _messages[i]),
        ),
      ),
    );
  }

  Future<void> _convertToTask(MimeMessage message) async {
    final subject = message.decodeSubject() ?? 'Mail-Aufgabe';
    await ref.read(taskRepositoryProvider).createTask(
          Task(
            id: '',
            text: subject,
            priority: 'medium',
            mailRef: message.uid?.toString(),
            tags: ['mail'],
          ),
        );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('"$subject" als Aufgabe gespeichert')),
      );
    }
  }
}
