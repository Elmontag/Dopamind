import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _kLocaleKey = 'locale';

/// Persists and exposes the app [Locale].
class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier() : super(const Locale('de')) {
    _load();
  }

  static const _storage = FlutterSecureStorage();

  Future<void> _load() async {
    final value = await _storage.read(key: _kLocaleKey);
    if (value == 'en') {
      state = const Locale('en');
    } else {
      state = const Locale('de');
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    await _storage.write(key: _kLocaleKey, value: locale.languageCode);
  }
}

final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier();
});
