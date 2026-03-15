import 'dart:convert';
import 'dart:io';

import 'package:device_calendar/device_calendar.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/theme/app_theme.dart';
import '../../data/database/app_database.dart';
import '../../data/database/daos/tasks_dao.dart';
import '../../data/database/daos/categories_dao.dart';
import '../../data/database/daos/focus_blocks_dao.dart';
import '../../data/database/daos/stats_dao.dart';
import '../../data/repositories/mail_repository.dart';
import '../../data/repositories/stats_repository.dart';
import '../../data/repositories/calendar_repository.dart';
import '../../shared/providers/settings_provider.dart';
import '../../shared/providers/theme_provider.dart';
import '../../shared/providers/locale_provider.dart';

/// Settings screen.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  // IMAP form controllers
  final _imapHostCtrl = TextEditingController();
  final _imapPortCtrl = TextEditingController(text: '993');
  final _imapUserCtrl = TextEditingController();
  final _imapPasswordCtrl = TextEditingController();
  bool _imapTls = true;
  bool _imapLoading = false;
  String? _imapStatus;

  // Calendar
  List<Calendar> _availableCalendars = [];
  bool _calendarLoading = false;

  @override
  void initState() {
    super.initState();
    _loadImapCreds();
    _loadCalendars();
  }

  Future<void> _loadImapCreds() async {
    final creds =
        await ref.read(mailRepositoryProvider).loadCredentials();
    if (creds != null && mounted) {
      setState(() {
        _imapHostCtrl.text = creds.host;
        _imapPortCtrl.text = creds.port.toString();
        _imapUserCtrl.text = creds.user;
        _imapPasswordCtrl.text = creds.password;
        _imapTls = creds.tls;
      });
    }
  }

  Future<void> _loadCalendars() async {
    setState(() => _calendarLoading = true);
    try {
      final hasPerms =
          await ref.read(calendarRepositoryProvider).hasPermissions();
      if (hasPerms) {
        final cals =
            await ref.read(calendarRepositoryProvider).getCalendars();
        if (mounted) setState(() => _availableCalendars = cals);
      }
    } finally {
      if (mounted) setState(() => _calendarLoading = false);
    }
  }

  @override
  void dispose() {
    _imapHostCtrl.dispose();
    _imapPortCtrl.dispose();
    _imapUserCtrl.dispose();
    _imapPasswordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final themeMode = ref.watch(themeModeProvider);
    final locale = ref.watch(localeProvider);
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Einstellungen')),
      body: ListView(
        children: [
          // ── Appearance ───────────────────────────────────────────────────
          _SectionHeader('Design', dc),
          ListTile(
            leading: const Icon(Icons.brightness_6),
            title: const Text('Farbschema'),
            trailing: DropdownButton<ThemeMode>(
              value: themeMode,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(
                    value: ThemeMode.dark, child: Text('Dunkel')),
                DropdownMenuItem(
                    value: ThemeMode.light, child: Text('Hell')),
                DropdownMenuItem(
                    value: ThemeMode.system, child: Text('System')),
              ],
              onChanged: (m) {
                if (m != null) {
                  ref.read(themeModeProvider.notifier).setThemeMode(m);
                }
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Sprache'),
            trailing: DropdownButton<String>(
              value: locale.languageCode,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: 'de', child: Text('Deutsch')),
                DropdownMenuItem(value: 'en', child: Text('English')),
              ],
              onChanged: (lang) {
                if (lang != null) {
                  ref
                      .read(localeProvider.notifier)
                      .setLocale(Locale(lang));
                }
              },
            ),
          ),

          // ── Work Window ──────────────────────────────────────────────────
          _SectionHeader('Arbeitsfenster', dc),
          _WorkWindowTile(
            settings: settings,
            onUpdate: (s) =>
                ref.read(settingsProvider.notifier).update(s),
          ),

          // ── Gamification ─────────────────────────────────────────────────
          _SectionHeader('Gamification', dc),
          SwitchListTile(
            secondary: const Icon(Icons.stars),
            title: const Text('XP aktiviert'),
            value: settings.xpEnabled,
            onChanged: (v) => ref
                .read(settingsProvider.notifier)
                .updateField((s) => s.copyWith(xpEnabled: v)),
          ),
          SwitchListTile(
            secondary: const Icon(Icons.celebration),
            title: const Text('Konfetti-Effekt'),
            value: settings.confettiEnabled,
            onChanged: (v) => ref
                .read(settingsProvider.notifier)
                .updateField((s) => s.copyWith(confettiEnabled: v)),
          ),
          SwitchListTile(
            secondary: const Icon(Icons.volume_up),
            title: const Text('Sounds'),
            value: settings.soundEnabled,
            onChanged: (v) => ref
                .read(settingsProvider.notifier)
                .updateField((s) => s.copyWith(soundEnabled: v)),
          ),

          // ── Compassion mode ───────────────────────────────────────────────
          _SectionHeader('Compassion Mode', dc),
          ListTile(
            leading: const Icon(Icons.favorite_border),
            title: const Text('Nicht mein Tag'),
            subtitle: const Text(
                'XP-Streak-Strafe für heute unterdrücken'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _activateCompassionMode(),
          ),

          // ── Size mappings ─────────────────────────────────────────────────
          _SectionHeader('Größen-Schätzungen (Minuten)', dc),
          _SizeMappingsTile(
            settings: settings,
            onUpdate: (s) =>
                ref.read(settingsProvider.notifier).update(s),
          ),

          // ── IMAP ─────────────────────────────────────────────────────────
          _SectionHeader('IMAP-Einstellungen', dc),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                TextField(
                  controller: _imapHostCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Host (z.B. imap.gmail.com)',
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _imapPortCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                            labelText: 'Port'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 3,
                      child: SwitchListTile(
                        title: const Text('TLS', style: TextStyle(fontSize: 13)),
                        value: _imapTls,
                        onChanged: (v) => setState(() => _imapTls = v),
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _imapUserCtrl,
                  decoration: const InputDecoration(
                      labelText: 'E-Mail-Adresse'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _imapPasswordCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                      labelText: 'Passwort / App-Passwort'),
                ),
                const SizedBox(height: 12),
                if (_imapStatus != null)
                  Text(
                    _imapStatus!,
                    style: TextStyle(
                      color: _imapStatus!.startsWith('✓')
                          ? dc.success
                          : dc.danger,
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _imapLoading
                            ? null
                            : _testImapConnection,
                        child: const Text('Verbindung testen'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed:
                            _imapLoading ? null : _saveImapCreds,
                        child: const Text('Speichern'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),

          // ── Calendar ─────────────────────────────────────────────────────
          _SectionHeader('Kalender', dc),
          ListTile(
            leading: const Icon(Icons.calendar_month),
            title: const Text('Kalender-Berechtigung'),
            trailing: ElevatedButton(
              onPressed: _requestCalendarPermission,
              child: const Text('Erlauben'),
            ),
          ),
          if (_calendarLoading)
            const Center(child: CircularProgressIndicator())
          else
            ..._availableCalendars.map((cal) {
              final selected = settings.selectedCalendarIds
                  .contains(cal.id);
              return CheckboxListTile(
                title: Text(cal.name ?? cal.id ?? ''),
                value: selected,
                onChanged: (v) {
                  final ids =
                      List<String>.from(settings.selectedCalendarIds);
                  if (v == true) {
                    if (cal.id != null) ids.add(cal.id!);
                  } else {
                    ids.remove(cal.id);
                  }
                  ref
                      .read(settingsProvider.notifier)
                      .updateField((s) => s.copyWith(
                            selectedCalendarIds: ids,
                          ));
                },
              );
            }),

          // ── Backup / Restore ─────────────────────────────────────────────
          _SectionHeader('Backup & Restore', dc),
          ListTile(
            leading: const Icon(Icons.upload),
            title: const Text('Daten exportieren'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _exportData,
          ),
          ListTile(
            leading: const Icon(Icons.download),
            title: const Text('Daten importieren'),
            trailing: const Icon(Icons.chevron_right),
            onTap: _importData,
          ),

          const SizedBox(height: 60),
        ],
      ),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  Future<void> _activateCompassionMode() async {
    final today =
        '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}';
    final stats = await ref.read(statsRepositoryProvider).getStats();
    await ref.read(statsRepositoryProvider).updateStats(
          stats.copyWith(compassionModeDate: today),
        );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Compassion Mode aktiviert 💙')),
      );
    }
  }

  Future<void> _testImapConnection() async {
    setState(() {
      _imapLoading = true;
      _imapStatus = null;
    });
    try {
      final creds = ImapCredentials(
        host: _imapHostCtrl.text.trim(),
        port: int.tryParse(_imapPortCtrl.text) ?? 993,
        user: _imapUserCtrl.text.trim(),
        password: _imapPasswordCtrl.text,
        tls: _imapTls,
      );
      final ok =
          await ref.read(mailRepositoryProvider).testConnection(creds);
      if (mounted) {
        setState(() => _imapStatus = ok
            ? '✓ Verbindung erfolgreich'
            : '✗ Verbindung fehlgeschlagen');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _imapStatus = '✗ Fehler: $e');
      }
    } finally {
      if (mounted) setState(() => _imapLoading = false);
    }
  }

  Future<void> _saveImapCreds() async {
    final creds = ImapCredentials(
      host: _imapHostCtrl.text.trim(),
      port: int.tryParse(_imapPortCtrl.text) ?? 993,
      user: _imapUserCtrl.text.trim(),
      password: _imapPasswordCtrl.text,
      tls: _imapTls,
    );
    await ref.read(mailRepositoryProvider).saveCredentials(creds);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('IMAP-Einstellungen gespeichert')),
      );
    }
  }

  Future<void> _requestCalendarPermission() async {
    final granted = await ref
        .read(calendarRepositoryProvider)
        .requestPermissions();
    if (granted) {
      await _loadCalendars();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text(
                  'Berechtigung verweigert – bitte in den Systemeinstellungen erlauben.')),
        );
      }
    }
  }

  Future<void> _exportData() async {
    try {
      final db = ref.read(appDatabaseProvider);

      // Collect all data
      final taskRows = await db.tasksDao.watchAllTasks().first;
      final tasks = taskRows.map(TasksDao.rowToTask).toList();

      final subtasksList = <Map<String, dynamic>>[];
      for (final t in tasks) {
        final subs = await db.tasksDao.getSubtasksForTask(t.id);
        subtasksList
            .addAll(subs.map(TasksDao.rowToSubtask).map((s) => s.toJson()));
      }

      final catRows = await db.categoriesDao.getAll();
      final categories = catRows.map(CategoriesDao.rowToCategory).toList();

      final fbRows = await db.focusBlocksDao
          .getForDateRange('2020-01-01', '2099-12-31');
      final focusBlocks =
          fbRows.map(FocusBlocksDao.rowToFocusBlock).toList();

      final statsRow = await db.statsDao.getStats();
      final stats = StatsDao.rowToStats(statsRow);

      final backup = {
        'version': 1,
        'exportedAt': DateTime.now().toIso8601String(),
        'tasks': tasks.map((t) => t.toJson()).toList(),
        'subtasks': subtasksList,
        'categories': categories.map((c) => c.toJson()).toList(),
        'focusBlocks': focusBlocks.map((f) => f.toJson()).toList(),
        'userStats': stats.toJson(),
      };

      final json = const JsonEncoder.withIndent('  ').convert(backup);
      final dir = await getTemporaryDirectory();
      final file = File(
          '${dir.path}/dopamind_backup_${DateTime.now().millisecondsSinceEpoch}.json');
      await file.writeAsString(json);

      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Dopamind Backup',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export fehlgeschlagen: $e')),
        );
      }
    }
  }

  Future<void> _importData() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['json'],
      );
      if (result == null || result.files.single.path == null) return;

      final file = File(result.files.single.path!);
      final content = await file.readAsString();
      final data = jsonDecode(content) as Map<String, dynamic>;

      final db = ref.read(appDatabaseProvider);
      final taskRepo = ref.read(appDatabaseProvider).tasksDao;

      // Import tasks
      final tasksList =
          (data['tasks'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ??
              [];
      for (final t in tasksList) {
        await taskRepo.upsertTask(
          _taskFromJson(t),
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Import erfolgreich!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Import fehlgeschlagen: $e')),
        );
      }
    }
  }

  static _taskFromJson(Map<String, dynamic> j) {
    return TasksDao.rowToTask(
      TasksTableData(
        id: j['id'] as String,
        text: j['text'] as String,
        priority: j['priority'] as String? ?? 'medium',
        completed: j['completed'] as bool? ?? false,
        completedAt: j['completedAt'] as String?,
        deadline: j['deadline'] as String?,
        scheduledDate: j['scheduledDate'] as String?,
        scheduledTime: j['scheduledTime'] as String?,
        estimatedMinutes: j['estimatedMinutes'] as int?,
        energyCost: j['energyCost'] as String? ?? 'medium',
        sortOrder: j['sortOrder'] as int? ?? 0,
        createdAt: j['createdAt'] as String?,
        updatedAt: j['updatedAt'] as String?,
        metadata: j['tags'] != null
            ? jsonEncode({'tags': j['tags']})
            : null,
      ),
    );
  }
}

// ── Helper widgets ─────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.title, this.dc);

  final String title;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: dc.muted,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _WorkWindowTile extends StatelessWidget {
  const _WorkWindowTile({
    required this.settings,
    required this.onUpdate,
  });

  final AppSettings settings;
  final void Function(AppSettings) onUpdate;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Beginn',
                    style: TextStyle(
                        color: dc.textSecondary, fontSize: 12)),
                InkWell(
                  onTap: () => _pickTime(context, true),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: dc.muted.withOpacity(0.4)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(settings.workStart),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ende',
                    style: TextStyle(
                        color: dc.textSecondary, fontSize: 12)),
                InkWell(
                  onTap: () => _pickTime(context, false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                          color: dc.muted.withOpacity(0.4)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(settings.workEnd),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickTime(BuildContext context, bool isStart) async {
    final parts = (isStart ? settings.workStart : settings.workEnd)
        .split(':');
    final initial = TimeOfDay(
      hour: int.parse(parts[0]),
      minute: int.parse(parts[1]),
    );
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
    );
    if (picked == null) return;
    final str =
        '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
    onUpdate(isStart
        ? settings.copyWith(workStart: str)
        : settings.copyWith(workEnd: str));
  }
}

class _SizeMappingsTile extends StatelessWidget {
  const _SizeMappingsTile({
    required this.settings,
    required this.onUpdate,
  });

  final AppSettings settings;
  final void Function(AppSettings) onUpdate;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final sizes = ['quick', 'short', 'medium', 'long'];
    final labels = {
      'quick': 'Schnell',
      'short': 'Kurz',
      'medium': 'Mittel',
      'long': 'Lang',
    };
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Wrap(
        spacing: 12,
        runSpacing: 8,
        children: sizes.map((size) {
          final ctrl = TextEditingController(
            text: (settings.sizeMappings[size] ?? 0).toString(),
          );
          return SizedBox(
            width: 130,
            child: TextField(
              controller: ctrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: labels[size],
                suffixText: 'min',
                isDense: true,
              ),
              onChanged: (v) {
                final n = int.tryParse(v);
                if (n == null) return;
                final newMappings =
                    Map<String, int>.from(settings.sizeMappings)
                      ..[size] = n;
                onUpdate(settings.copyWith(sizeMappings: newMappings));
              },
            ),
          );
        }).toList(),
      ),
    );
  }
}
