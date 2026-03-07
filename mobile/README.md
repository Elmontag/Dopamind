# Dopamind Mobile

Serverlose React Native (Expo) Single-User-App für Dopamind. Alle Daten werden lokal auf dem Gerät gespeichert – kein Backend, kein Login, vollständig offline-first.

## Überblick

Dopamind Mobile reproduziert alle Kernfeatures der Web-App ohne Backend:

- **Aufgabenverwaltung** – Erstellen, bearbeiten, erledigen, priorisieren
- **Gamification** – XP, Level, Streak, Achievements, Daily Challenges
- **Fokus-Timer** – Pomodoro-ähnlicher Task-Timer mit Zeiterfassung
- **Planer** – Wochenansicht mit Kalender-Events (lokal)
- **Einstellungen** – Sprache, Gamification, Feature-Toggles, Datenexport
- **Offline-first** – AsyncStorage für alle persistenten Daten

## Architektur

```
mobile/
├── app/                    # Expo Router Screens
│   ├── _layout.tsx         # Root layout (alle Provider)
│   └── (tabs)/             # Tab-Navigation
│       ├── _layout.tsx     # Tab-Bar-Konfiguration
│       ├── index.tsx       # Home (Dashboard)
│       ├── tasks.tsx       # Aufgabenliste
│       ├── planner.tsx     # Wochenplaner
│       ├── achievements.tsx # Erfolge & Statistiken
│       └── settings.tsx    # Einstellungen
├── src/
│   ├── context/            # React Context (portiert vom Frontend)
│   │   ├── AppContext.tsx       # Kernlogik: Tasks, XP, Achievements
│   │   ├── SettingsContext.tsx  # App-Einstellungen
│   │   ├── FocusTimerContext.tsx # Focus-/Task-Timer
│   │   ├── CalendarContext.tsx  # Lokale Kalender-Events
│   │   ├── ResourceMonitorContext.tsx # Abwesenheits-Logik
│   │   └── I18nContext.tsx      # DE/EN Übersetzungen
│   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── TaskCard.tsx
│   │   ├── XpBar.tsx
│   │   ├── EnergyBadge.tsx
│   │   ├── RewardToast.tsx
│   │   ├── AddTaskModal.tsx
│   │   └── FocusTimerWidget.tsx
│   ├── storage/
│   │   └── storage.ts      # AsyncStorage-Wrapper
│   ├── types/
│   │   └── index.ts        # TypeScript-Typen
│   ├── utils/
│   │   ├── date.ts         # Datums-Hilfsfunktionen
│   │   └── task.ts         # Aufgaben-Hilfsfunktionen
│   └── i18n/
│       ├── de.json
│       ├── en.json
│       └── dailyChallenges.json
└── assets/                 # App-Icons, Splash
```

## Voraussetzungen

- **Node.js** 18+
- **npm** 9+ oder **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (für Builds): `npm install -g eas-cli`
- Android Studio oder Xcode (für lokale Builds/Emulatoren)

## Setup

```bash
cd mobile
npm install
```

## Entwicklung starten

```bash
# Im Browser / Expo Go
npm start

# Android-Emulator
npm run android

# iOS-Simulator (nur macOS)
npm run ios
```

## Android-APK bauen (EAS Build)

```bash
# Login bei Expo
eas login

# Preview-Build (APK)
npm run build:android
# oder direkt:
eas build --platform android --profile preview
```

Der Build dauert ca. 5-10 Minuten. Danach wird ein Download-Link angezeigt.

## APK installieren

1. APK vom EAS-Build herunterladen
2. Auf Android-Gerät übertragen
3. "Aus unbekannten Quellen installieren" in den Einstellungen erlauben
4. APK öffnen und installieren

## Technologie-Stack

| Paket | Zweck |
|-------|-------|
| `expo` ~51 | Build-System, Dev-Server |
| `expo-router` ~3.5 | Dateibasiertes Routing |
| `@react-native-async-storage/async-storage` | Lokale Datenpersistenz |
| `nativewind` + `tailwindcss` | Styling |
| `lucide-react-native` | Icons |
| `react-native-reanimated` | Animationen |
| `react-native-gesture-handler` | Gesten |
| `expo-haptics` | Haptisches Feedback |
| `expo-notifications` | Push-Benachrichtigungen |

## Daten-Speicherung

Alle Daten werden mit `@react-native-async-storage/async-storage` lokal gespeichert:

| Key | Inhalt |
|-----|--------|
| `dopamind-state` | Tasks, XP, Streak, Achievements |
| `dopamind-settings` | App-Einstellungen |
| `dopamind-calendar` | Kalender-Events |
| `dopamind-resource-monitor` | Abwesenheits-Daten |
| `dopamind-lang` | Sprachpräferenz |

## Roadmap

- [ ] **IMAP-Integration** – E-Mails als Aufgaben (benötigt Backend oder lokalen IMAP-Client)
- [ ] **CalDAV-Sync** – Externe Kalender synchronisieren
- [ ] **Widgets** – Android/iOS Home-Screen-Widget mit nächster Aufgabe
- [ ] **iOS-Support** – EAS Build für iOS (App Store oder TestFlight)
- [ ] **Benachrichtigungen** – Erinnerungen für Deadlines und Fokus-Sessions
- [ ] **Offline-Sync** – Optionale Synchronisation mit der Web-App via QR-Code
- [ ] **Subtask-Swipe** – Wischgeste zum Erledigen von Subtasks
- [ ] **Dark Mode** – Verbesserte Dark-Mode-Unterstützung via NativeWind
