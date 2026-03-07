import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// App-wide settings model.
class AppSettings {
  const AppSettings({
    this.workStart = '08:00',
    this.workEnd = '17:00',
    this.activeDays = const [1, 2, 3, 4, 5],
    this.xpEnabled = true,
    this.confettiEnabled = true,
    this.soundEnabled = false,
    this.selectedCalendarIds = const [],
    this.sizeMappings = const {
      'quick': 10,
      'short': 25,
      'medium': 45,
      'long': 90,
    },
  });

  final String workStart;
  final String workEnd;
  final List<int> activeDays;
  final bool xpEnabled;
  final bool confettiEnabled;
  final bool soundEnabled;
  final List<String> selectedCalendarIds;
  final Map<String, int> sizeMappings;

  AppSettings copyWith({
    String? workStart,
    String? workEnd,
    List<int>? activeDays,
    bool? xpEnabled,
    bool? confettiEnabled,
    bool? soundEnabled,
    List<String>? selectedCalendarIds,
    Map<String, int>? sizeMappings,
  }) {
    return AppSettings(
      workStart: workStart ?? this.workStart,
      workEnd: workEnd ?? this.workEnd,
      activeDays: activeDays ?? this.activeDays,
      xpEnabled: xpEnabled ?? this.xpEnabled,
      confettiEnabled: confettiEnabled ?? this.confettiEnabled,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      selectedCalendarIds: selectedCalendarIds ?? this.selectedCalendarIds,
      sizeMappings: sizeMappings ?? this.sizeMappings,
    );
  }

  Map<String, dynamic> toJson() => {
        'workStart': workStart,
        'workEnd': workEnd,
        'activeDays': activeDays,
        'xpEnabled': xpEnabled,
        'confettiEnabled': confettiEnabled,
        'soundEnabled': soundEnabled,
        'selectedCalendarIds': selectedCalendarIds,
        'sizeMappings': sizeMappings,
      };

  factory AppSettings.fromJson(Map<String, dynamic> json) => AppSettings(
        workStart: json['workStart'] as String? ?? '08:00',
        workEnd: json['workEnd'] as String? ?? '17:00',
        activeDays: (json['activeDays'] as List<dynamic>?)
                ?.map((e) => e as int)
                .toList() ??
            [1, 2, 3, 4, 5],
        xpEnabled: json['xpEnabled'] as bool? ?? true,
        confettiEnabled: json['confettiEnabled'] as bool? ?? true,
        soundEnabled: json['soundEnabled'] as bool? ?? false,
        selectedCalendarIds:
            (json['selectedCalendarIds'] as List<dynamic>?)
                    ?.map((e) => e as String)
                    .toList() ??
                [],
        sizeMappings: (json['sizeMappings'] as Map<String, dynamic>?)
                ?.map((k, v) => MapEntry(k, v as int)) ??
            const {'quick': 10, 'short': 25, 'medium': 45, 'long': 90},
      );
}

// ── Notifier ───────────────────────────────────────────────────────────────

const _kSettingsKey = 'app_settings_json';

class SettingsNotifier extends StateNotifier<AppSettings> {
  SettingsNotifier() : super(const AppSettings()) {
    _load();
  }

  static const _storage = FlutterSecureStorage();

  Future<void> _load() async {
    final raw = await _storage.read(key: _kSettingsKey);
    if (raw != null) {
      try {
        state = AppSettings.fromJson(
            jsonDecode(raw) as Map<String, dynamic>);
      } catch (_) {}
    }
  }

  Future<void> update(AppSettings settings) async {
    state = settings;
    await _storage.write(
        key: _kSettingsKey, value: jsonEncode(settings.toJson()));
  }

  Future<void> updateField(AppSettings Function(AppSettings) updater) =>
      update(updater(state));
}

final settingsProvider =
    StateNotifierProvider<SettingsNotifier, AppSettings>((ref) {
  return SettingsNotifier();
});
