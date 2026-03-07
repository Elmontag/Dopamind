# Dopamind

A natively compiled, fully offline Android productivity app built with Flutter. No backend, no server, no login – all data lives in SQLite on the device.

## Description

Dopamind is a personal task and focus manager designed for users who struggle with task overload, unclear priorities or maintaining a structured workday. It assigns tasks to time blocks based on priority and energy level, optionally reads from the native Android calendar and an IMAP mailbox, and motivates through a gamification system.

Everything runs locally on the device. The only optional internet connection is IMAP mail retrieval.

## Features

- **Task management**: CRUD with priority (Muss sein / Wichtig / Wäre schön), energy cost, deadlines, subtasks, tags, categories, drag-and-drop reordering
- **Home screen**: one highlighted "Next Task", morning / afternoon / evening energy blocks, daily energy check-in
- **Compassion Mode**: "Not my day" button suppresses XP streak penalties during sick days or holidays
- **Focus Timer (Pomodoro)**: 25 / 45 / 60 min, task-specific, flow-detection when you keep going after the timer
- **Gamification**: XP system, 10 level ranks, 25+ achievements, streak multiplier (up to 2×), reward toast + confetti
- **Native Android calendar**: displays device calendar events via `device_calendar`; calendar selection in Settings
- **IMAP mail** (optional): inbox browsing, mail-to-task conversion, secure credential storage via `flutter_secure_storage`
- **Planner screen**: week and month overview combining tasks and calendar events
- **Achievements screen**: XP progress bar, achievement badges, weekly heatmap, focus-time stats
- **Settings**: dark / light mode, language (DE / EN), working hours, gamification toggles, JSON backup / restore
- **Offline-first**: all data stored in SQLite via Drift; no network required

## Requirements

- Flutter 3.22 or later
- Android SDK (min. Android 6.0, API 23)
- A connected Android device or emulator

## Build

```bash
cd flutter_app

# Install dependencies
flutter pub get

# Generate Drift database code and Riverpod providers
dart run build_runner build --delete-conflicting-outputs

# Run on a connected device or emulator
flutter run
```

## Project Layout

```
flutter_app/
├── pubspec.yaml
├── android/                        # Android project files and AndroidManifest.xml
└── lib/
    ├── main.dart                   # App entry point, ProviderScope
    ├── app.dart                    # MaterialApp, GoRouter, ThemeData
    ├── core/
    │   ├── theme/                  # AppTheme (dark/light), AppColors
    │   ├── l10n/                   # ARB translation files (de, en)
    │   └── router/                 # GoRouter route definitions
    ├── data/
    │   ├── database/               # Drift SQLite database, tables, DAOs
    │   ├── models/                 # Plain Dart model classes
    │   └── repositories/           # Repository abstractions + Riverpod providers
    ├── domain/
    │   ├── gamification/           # XP, level, achievement, streak logic
    │   └── scheduler/              # Energy-block day scheduling algorithm
    ├── features/
    │   ├── home/                   # Today view: energy blocks, Next Task, check-in
    │   ├── tasks/                  # Task list with drag-and-drop and form modal
    │   ├── planner/                # Week / month planner
    │   ├── achievements/           # Stats, XP bar, achievement badges
    │   ├── mail/                   # IMAP mail list and detail
    │   └── settings/               # App settings screen
    └── shared/
        ├── providers/              # Theme, locale, settings providers
        └── widgets/                # GlassCard, PrimaryButton, RewardToast, MicroConfetti, FocusTimer
```

## Permissions (AndroidManifest.xml)

| Permission | Purpose |
|---|---|
| `INTERNET` | Optional IMAP mail retrieval |
| `READ_CALENDAR` / `WRITE_CALENDAR` | Native device calendar access |
| `POST_NOTIFICATIONS` | Deadline reminders and focus-timer alerts |
| `RECEIVE_BOOT_COMPLETED` | Reschedule notifications after reboot |
| `VIBRATE` | Haptic feedback on timer completion |

## License

MIT
