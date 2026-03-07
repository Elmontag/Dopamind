// GENERATED CODE — DO NOT EDIT BY HAND
//
// Run `flutter gen-l10n` (or `flutter pub get`) to regenerate this file
// from the ARB files in lib/core/l10n/.
//
// This stub is provided so that `lib/app.dart` can import the type before
// code generation has been run.  The actual implementation is produced by
// the Flutter localizations tool.

export 'package:flutter_localizations/flutter_localizations.dart'
    show
        GlobalCupertinoLocalizations,
        GlobalMaterialLocalizations,
        GlobalWidgetsLocalizations;

// ignore: unused_import
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

/// Placeholder – replaced by `flutter gen-l10n` output.
abstract class AppLocalizations {
  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static AppLocalizations of(BuildContext context) =>
      Localizations.of<AppLocalizations>(context, AppLocalizations)!;

  String get appTitle;
  String get navHome;
  String get navTasks;
  String get navPlanner;
  String get navAchievements;
  String get navMail;
  String get navSettings;

  String get taskPriorityHigh;
  String get taskPriorityMedium;
  String get taskPriorityLow;

  String get energyHigh;
  String get energyMedium;
  String get energyLow;

  String get blockMorning;
  String get blockAfternoon;
  String get blockEvening;

  String get nextTask;
  String get noTasksToday;

  String get energyCheckin;
  String get energyCheckinSubtitle;
  String get skipCheckin;

  String get compassionModeTitle;
  String get compassionModeSubtitle;
  String get notMyDayButton;
  String get absenceTypeSick;
  String get absenceTypeVacation;

  String get addTask;
  String get editTask;
  String get deleteTask;
  String get completeTask;
  String get reopenTask;
  String get moveToTomorrow;

  String get taskText;
  String get taskTextHint;
  String get taskDeadline;
  String get taskScheduledDate;
  String get taskScheduledTime;
  String get taskEstimatedMinutes;
  String get taskTags;
  String get taskCategory;
  String get taskEnergyCost;
  String get taskPriority;

  String get subtaskAdd;
  String get subtaskPlaceholder;

  String get scheduledTimeMorning;
  String get scheduledTimeAfternoon;
  String get scheduledTimeEvening;
  String get scheduledTimeExact;

  String get focusTimerTitle;
  String get focusTimerStart;
  String get focusTimerPause;
  String get focusTimerStop;
  String get focusTimerDone;
  String focusTimerXpGained(int xp);
  String get focusTimerFlowDetected;
  String get focusTimerSelectTask;

  String get plannerTitle;
  String get plannerWeekView;
  String get plannerMonthView;

  String get achievementsTitle;
  String achievementsXp(int xp);
  String achievementsLevel(int level);
  String achievementsStreak(int days);
  String get achievementsLocked;
  String get achievementsUnlocked;

  String get mailTitle;
  String get mailNoConfig;
  String get mailConfigureButton;
  String get mailConvertToTask;
  String get mailMarkImportant;
  String get mailMarkTodo;
  String get mailMarkWaiting;
  String get mailMarkDone;
  String get mailDelete;
  String get mailInbox;

  String get settingsTitle;
  String get settingsTheme;
  String get settingsThemeDark;
  String get settingsThemeLight;
  String get settingsThemeSystem;
  String get settingsLanguage;
  String get settingsLanguageDe;
  String get settingsLanguageEn;
  String get settingsAssistanceWindow;
  String get settingsWorkStart;
  String get settingsWorkEnd;
  String get settingsActiveDays;
  String get settingsGamification;
  String get settingsXpEnabled;
  String get settingsConfettiEnabled;
  String get settingsSoundEnabled;
  String get settingsImap;
  String get settingsImapHost;
  String get settingsImapPort;
  String get settingsImapUser;
  String get settingsImapPassword;
  String get settingsImapTls;
  String get settingsImapSave;
  String get settingsImapTest;
  String get settingsCalendar;
  String get settingsCalendarPermission;
  String get settingsCalendarNone;
  String get settingsBackup;
  String get settingsExport;
  String get settingsImport;
  String get settingsImportSuccess;
  String get settingsImportError;
  String get settingsSizeMappings;
  String get settingsSizeQuick;
  String get settingsSizeShort;
  String get settingsSizeMedium;
  String get settingsSizeLong;

  String get confirmDelete;
  String get confirmDeleteMessage;
  String get cancel;
  String get confirm;
  String get save;
  String get close;
  String get done;
  String get edit;
  String get delete;
  String get add;

  String xpGained(int xp);
  String levelUp(int level);

  String get overdue;
  String get dueSoon;
  String get dueToday;

  String get calendarPermissionRequired;
  String get calendarPermissionMessage;
  String get calendarGrantPermission;

  String get weekDayMon;
  String get weekDayTue;
  String get weekDayWed;
  String get weekDayThu;
  String get weekDayFri;
  String get weekDaySat;
  String get weekDaySun;

  String get statsWeeklyCompleted;
  String get statsTotalFocusTime;
  String get statsCompletedThisMonth;
  String get statsFilter;
  String get statsFilterWeek;
  String get statsFilterMonth;
  String get statsFilterYear;

  String get notificationDeadlineTitle;
  String notificationDeadlineBody(String title);
  String get notificationFocusTitle;
  String get notificationFocusBody;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) =>
      ['de', 'en'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) async =>
      _AppLocalizationsImpl(locale.languageCode == 'en'
          ? _enStrings
          : _deStrings);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

class _AppLocalizationsImpl implements AppLocalizations {
  const _AppLocalizationsImpl(this._s);
  final Map<String, String> _s;

  String _t(String key) => _s[key] ?? key;

  @override String get appTitle => _t('appTitle');
  @override String get navHome => _t('navHome');
  @override String get navTasks => _t('navTasks');
  @override String get navPlanner => _t('navPlanner');
  @override String get navAchievements => _t('navAchievements');
  @override String get navMail => _t('navMail');
  @override String get navSettings => _t('navSettings');
  @override String get taskPriorityHigh => _t('taskPriorityHigh');
  @override String get taskPriorityMedium => _t('taskPriorityMedium');
  @override String get taskPriorityLow => _t('taskPriorityLow');
  @override String get energyHigh => _t('energyHigh');
  @override String get energyMedium => _t('energyMedium');
  @override String get energyLow => _t('energyLow');
  @override String get blockMorning => _t('blockMorning');
  @override String get blockAfternoon => _t('blockAfternoon');
  @override String get blockEvening => _t('blockEvening');
  @override String get nextTask => _t('nextTask');
  @override String get noTasksToday => _t('noTasksToday');
  @override String get energyCheckin => _t('energyCheckin');
  @override String get energyCheckinSubtitle => _t('energyCheckinSubtitle');
  @override String get skipCheckin => _t('skipCheckin');
  @override String get compassionModeTitle => _t('compassionModeTitle');
  @override String get compassionModeSubtitle => _t('compassionModeSubtitle');
  @override String get notMyDayButton => _t('notMyDayButton');
  @override String get absenceTypeSick => _t('absenceTypeSick');
  @override String get absenceTypeVacation => _t('absenceTypeVacation');
  @override String get addTask => _t('addTask');
  @override String get editTask => _t('editTask');
  @override String get deleteTask => _t('deleteTask');
  @override String get completeTask => _t('completeTask');
  @override String get reopenTask => _t('reopenTask');
  @override String get moveToTomorrow => _t('moveToTomorrow');
  @override String get taskText => _t('taskText');
  @override String get taskTextHint => _t('taskTextHint');
  @override String get taskDeadline => _t('taskDeadline');
  @override String get taskScheduledDate => _t('taskScheduledDate');
  @override String get taskScheduledTime => _t('taskScheduledTime');
  @override String get taskEstimatedMinutes => _t('taskEstimatedMinutes');
  @override String get taskTags => _t('taskTags');
  @override String get taskCategory => _t('taskCategory');
  @override String get taskEnergyCost => _t('taskEnergyCost');
  @override String get taskPriority => _t('taskPriority');
  @override String get subtaskAdd => _t('subtaskAdd');
  @override String get subtaskPlaceholder => _t('subtaskPlaceholder');
  @override String get scheduledTimeMorning => _t('scheduledTimeMorning');
  @override String get scheduledTimeAfternoon => _t('scheduledTimeAfternoon');
  @override String get scheduledTimeEvening => _t('scheduledTimeEvening');
  @override String get scheduledTimeExact => _t('scheduledTimeExact');
  @override String get focusTimerTitle => _t('focusTimerTitle');
  @override String get focusTimerStart => _t('focusTimerStart');
  @override String get focusTimerPause => _t('focusTimerPause');
  @override String get focusTimerStop => _t('focusTimerStop');
  @override String get focusTimerDone => _t('focusTimerDone');
  @override String focusTimerXpGained(int xp) => '+$xp XP';
  @override String get focusTimerFlowDetected => _t('focusTimerFlowDetected');
  @override String get focusTimerSelectTask => _t('focusTimerSelectTask');
  @override String get plannerTitle => _t('plannerTitle');
  @override String get plannerWeekView => _t('plannerWeekView');
  @override String get plannerMonthView => _t('plannerMonthView');
  @override String get achievementsTitle => _t('achievementsTitle');
  @override String achievementsXp(int xp) => '$xp XP';
  @override String achievementsLevel(int level) => 'Level $level';
  @override String achievementsStreak(int days) =>
      '${_t('achievementsStreak').replaceFirst('{days}', '$days')}';
  @override String get achievementsLocked => _t('achievementsLocked');
  @override String get achievementsUnlocked => _t('achievementsUnlocked');
  @override String get mailTitle => _t('mailTitle');
  @override String get mailNoConfig => _t('mailNoConfig');
  @override String get mailConfigureButton => _t('mailConfigureButton');
  @override String get mailConvertToTask => _t('mailConvertToTask');
  @override String get mailMarkImportant => _t('mailMarkImportant');
  @override String get mailMarkTodo => _t('mailMarkTodo');
  @override String get mailMarkWaiting => _t('mailMarkWaiting');
  @override String get mailMarkDone => _t('mailMarkDone');
  @override String get mailDelete => _t('mailDelete');
  @override String get mailInbox => _t('mailInbox');
  @override String get settingsTitle => _t('settingsTitle');
  @override String get settingsTheme => _t('settingsTheme');
  @override String get settingsThemeDark => _t('settingsThemeDark');
  @override String get settingsThemeLight => _t('settingsThemeLight');
  @override String get settingsThemeSystem => _t('settingsThemeSystem');
  @override String get settingsLanguage => _t('settingsLanguage');
  @override String get settingsLanguageDe => _t('settingsLanguageDe');
  @override String get settingsLanguageEn => _t('settingsLanguageEn');
  @override String get settingsAssistanceWindow => _t('settingsAssistanceWindow');
  @override String get settingsWorkStart => _t('settingsWorkStart');
  @override String get settingsWorkEnd => _t('settingsWorkEnd');
  @override String get settingsActiveDays => _t('settingsActiveDays');
  @override String get settingsGamification => _t('settingsGamification');
  @override String get settingsXpEnabled => _t('settingsXpEnabled');
  @override String get settingsConfettiEnabled => _t('settingsConfettiEnabled');
  @override String get settingsSoundEnabled => _t('settingsSoundEnabled');
  @override String get settingsImap => _t('settingsImap');
  @override String get settingsImapHost => _t('settingsImapHost');
  @override String get settingsImapPort => _t('settingsImapPort');
  @override String get settingsImapUser => _t('settingsImapUser');
  @override String get settingsImapPassword => _t('settingsImapPassword');
  @override String get settingsImapTls => _t('settingsImapTls');
  @override String get settingsImapSave => _t('settingsImapSave');
  @override String get settingsImapTest => _t('settingsImapTest');
  @override String get settingsCalendar => _t('settingsCalendar');
  @override String get settingsCalendarPermission => _t('settingsCalendarPermission');
  @override String get settingsCalendarNone => _t('settingsCalendarNone');
  @override String get settingsBackup => _t('settingsBackup');
  @override String get settingsExport => _t('settingsExport');
  @override String get settingsImport => _t('settingsImport');
  @override String get settingsImportSuccess => _t('settingsImportSuccess');
  @override String get settingsImportError => _t('settingsImportError');
  @override String get settingsSizeMappings => _t('settingsSizeMappings');
  @override String get settingsSizeQuick => _t('settingsSizeQuick');
  @override String get settingsSizeShort => _t('settingsSizeShort');
  @override String get settingsSizeMedium => _t('settingsSizeMedium');
  @override String get settingsSizeLong => _t('settingsSizeLong');
  @override String get confirmDelete => _t('confirmDelete');
  @override String get confirmDeleteMessage => _t('confirmDeleteMessage');
  @override String get cancel => _t('cancel');
  @override String get confirm => _t('confirm');
  @override String get save => _t('save');
  @override String get close => _t('close');
  @override String get done => _t('done');
  @override String get edit => _t('edit');
  @override String get delete => _t('delete');
  @override String get add => _t('add');
  @override String xpGained(int xp) => '+$xp XP';
  @override String levelUp(int level) => 'Level $level!';
  @override String get overdue => _t('overdue');
  @override String get dueSoon => _t('dueSoon');
  @override String get dueToday => _t('dueToday');
  @override String get calendarPermissionRequired => _t('calendarPermissionRequired');
  @override String get calendarPermissionMessage => _t('calendarPermissionMessage');
  @override String get calendarGrantPermission => _t('calendarGrantPermission');
  @override String get weekDayMon => _t('weekDayMon');
  @override String get weekDayTue => _t('weekDayTue');
  @override String get weekDayWed => _t('weekDayWed');
  @override String get weekDayThu => _t('weekDayThu');
  @override String get weekDayFri => _t('weekDayFri');
  @override String get weekDaySat => _t('weekDaySat');
  @override String get weekDaySun => _t('weekDaySun');
  @override String get statsWeeklyCompleted => _t('statsWeeklyCompleted');
  @override String get statsTotalFocusTime => _t('statsTotalFocusTime');
  @override String get statsCompletedThisMonth => _t('statsCompletedThisMonth');
  @override String get statsFilter => _t('statsFilter');
  @override String get statsFilterWeek => _t('statsFilterWeek');
  @override String get statsFilterMonth => _t('statsFilterMonth');
  @override String get statsFilterYear => _t('statsFilterYear');
  @override String get notificationDeadlineTitle => _t('notificationDeadlineTitle');
  @override String notificationDeadlineBody(String title) =>
      _t('notificationDeadlineTitle').replaceFirst('{title}', title);
  @override String get notificationFocusTitle => _t('notificationFocusTitle');
  @override String get notificationFocusBody => _t('notificationFocusBody');
}

const Map<String, String> _deStrings = {
  'appTitle': 'Dopamind',
  'navHome': 'Heute',
  'navTasks': 'Aufgaben',
  'navPlanner': 'Planer',
  'navAchievements': 'Erfolge',
  'navMail': 'Mail',
  'navSettings': 'Einstellungen',
  'taskPriorityHigh': 'Muss sein',
  'taskPriorityMedium': 'Wichtig',
  'taskPriorityLow': 'Wäre schön',
  'energyHigh': 'Hohe Energie',
  'energyMedium': 'Normale Energie',
  'energyLow': 'Niedrige Energie',
  'blockMorning': 'Morgen',
  'blockAfternoon': 'Mittag',
  'blockEvening': 'Abend',
  'nextTask': 'Nächste Aufgabe',
  'noTasksToday': 'Keine Aufgaben für heute',
  'energyCheckin': 'Wie ist deine Energie heute?',
  'energyCheckinSubtitle': 'Das hilft bei der Tagesplanung',
  'skipCheckin': 'Überspringen',
  'compassionModeTitle': 'Nicht mein Tag',
  'compassionModeSubtitle': 'XP-Strafe unterdrückt',
  'notMyDayButton': 'Nicht mein Tag',
  'absenceTypeSick': 'Krank',
  'absenceTypeVacation': 'Urlaub',
  'addTask': 'Aufgabe hinzufügen',
  'editTask': 'Aufgabe bearbeiten',
  'deleteTask': 'Aufgabe löschen',
  'completeTask': 'Aufgabe abschließen',
  'reopenTask': 'Aufgabe wieder öffnen',
  'moveToTomorrow': 'Auf morgen verschieben',
  'taskText': 'Aufgabe',
  'taskTextHint': 'Was möchtest du erledigen?',
  'taskDeadline': 'Deadline',
  'taskScheduledDate': 'Datum',
  'taskScheduledTime': 'Tageszeit',
  'taskEstimatedMinutes': 'Geschätzte Dauer (min)',
  'taskTags': 'Tags',
  'taskCategory': 'Kategorie',
  'taskEnergyCost': 'Energieaufwand',
  'taskPriority': 'Priorität',
  'subtaskAdd': 'Teilaufgabe hinzufügen',
  'subtaskPlaceholder': 'Neue Teilaufgabe…',
  'scheduledTimeMorning': 'Morgens',
  'scheduledTimeAfternoon': 'Mittags',
  'scheduledTimeEvening': 'Abends',
  'scheduledTimeExact': 'Genau',
  'focusTimerTitle': 'Fokus-Timer',
  'focusTimerStart': 'Starten',
  'focusTimerPause': 'Pausieren',
  'focusTimerStop': 'Beenden',
  'focusTimerDone': 'Fokus-Session abgeschlossen!',
  'focusTimerFlowDetected': 'Flow-Modus aktiv – weiter so!',
  'focusTimerSelectTask': 'Aufgabe auswählen',
  'plannerTitle': 'Planer',
  'plannerWeekView': 'Woche',
  'plannerMonthView': 'Monat',
  'achievementsTitle': 'Erfolge',
  'achievementsStreak': '{days} Tage Streak',
  'achievementsLocked': 'Noch nicht freigeschaltet',
  'achievementsUnlocked': 'Freigeschaltet',
  'mailTitle': 'Mail',
  'mailNoConfig': 'Keine IMAP-Verbindung konfiguriert',
  'mailConfigureButton': 'IMAP konfigurieren',
  'mailConvertToTask': 'Als Aufgabe speichern',
  'mailMarkImportant': 'Wichtig',
  'mailMarkTodo': 'Todo',
  'mailMarkWaiting': 'Wartet',
  'mailMarkDone': 'Erledigt',
  'mailDelete': 'Löschen',
  'mailInbox': 'Posteingang',
  'settingsTitle': 'Einstellungen',
  'settingsTheme': 'Design',
  'settingsThemeDark': 'Dunkel',
  'settingsThemeLight': 'Hell',
  'settingsThemeSystem': 'System',
  'settingsLanguage': 'Sprache',
  'settingsLanguageDe': 'Deutsch',
  'settingsLanguageEn': 'Englisch',
  'settingsAssistanceWindow': 'Arbeitsfenster',
  'settingsWorkStart': 'Beginn',
  'settingsWorkEnd': 'Ende',
  'settingsActiveDays': 'Aktive Tage',
  'settingsGamification': 'Gamification',
  'settingsXpEnabled': 'XP aktiviert',
  'settingsConfettiEnabled': 'Konfetti-Effekt',
  'settingsSoundEnabled': 'Sounds',
  'settingsImap': 'IMAP-Einstellungen',
  'settingsImapHost': 'Host',
  'settingsImapPort': 'Port',
  'settingsImapUser': 'Benutzer',
  'settingsImapPassword': 'Passwort',
  'settingsImapTls': 'TLS verwenden',
  'settingsImapSave': 'Speichern',
  'settingsImapTest': 'Verbindung testen',
  'settingsCalendar': 'Kalender',
  'settingsCalendarPermission': 'Kalender-Berechtigung erteilen',
  'settingsCalendarNone': 'Keine Kalender ausgewählt',
  'settingsBackup': 'Backup',
  'settingsExport': 'Daten exportieren',
  'settingsImport': 'Daten importieren',
  'settingsImportSuccess': 'Import erfolgreich',
  'settingsImportError': 'Import fehlgeschlagen',
  'settingsSizeMappings': 'Größen-Schätzungen',
  'settingsSizeQuick': 'Schnell',
  'settingsSizeShort': 'Kurz',
  'settingsSizeMedium': 'Mittel',
  'settingsSizeLong': 'Lang',
  'confirmDelete': 'Löschen bestätigen',
  'confirmDeleteMessage': 'Soll diese Aufgabe wirklich gelöscht werden?',
  'cancel': 'Abbrechen',
  'confirm': 'Bestätigen',
  'save': 'Speichern',
  'close': 'Schließen',
  'done': 'Fertig',
  'edit': 'Bearbeiten',
  'delete': 'Löschen',
  'add': 'Hinzufügen',
  'overdue': 'Überfällig',
  'dueSoon': 'Bald fällig',
  'dueToday': 'Heute fällig',
  'calendarPermissionRequired': 'Kalender-Berechtigung erforderlich',
  'calendarPermissionMessage': 'Bitte erteile der App Zugriff auf deinen Kalender in den Einstellungen.',
  'calendarGrantPermission': 'Berechtigung erteilen',
  'weekDayMon': 'Mo',
  'weekDayTue': 'Di',
  'weekDayWed': 'Mi',
  'weekDayThu': 'Do',
  'weekDayFri': 'Fr',
  'weekDaySat': 'Sa',
  'weekDaySun': 'So',
  'statsWeeklyCompleted': 'Diese Woche abgeschlossen',
  'statsTotalFocusTime': 'Gesamte Fokuszeit',
  'statsCompletedThisMonth': 'Diesen Monat abgeschlossen',
  'statsFilter': 'Zeitraum',
  'statsFilterWeek': 'Woche',
  'statsFilterMonth': 'Monat',
  'statsFilterYear': 'Jahr',
  'notificationDeadlineTitle': 'Deadline morgen',
  'notificationDeadlineBody': 'Aufgabe "{title}" ist morgen fällig.',
  'notificationFocusTitle': 'Fokus-Session abgeschlossen!',
  'notificationFocusBody': '+20 XP für deine Fokus-Session.',
};

const Map<String, String> _enStrings = {
  'appTitle': 'Dopamind',
  'navHome': 'Today',
  'navTasks': 'Tasks',
  'navPlanner': 'Planner',
  'navAchievements': 'Achievements',
  'navMail': 'Mail',
  'navSettings': 'Settings',
  'taskPriorityHigh': 'Must do',
  'taskPriorityMedium': 'Important',
  'taskPriorityLow': 'Nice to have',
  'energyHigh': 'High Energy',
  'energyMedium': 'Normal Energy',
  'energyLow': 'Low Energy',
  'blockMorning': 'Morning',
  'blockAfternoon': 'Afternoon',
  'blockEvening': 'Evening',
  'nextTask': 'Next Task',
  'noTasksToday': 'No tasks for today',
  'energyCheckin': 'How is your energy today?',
  'energyCheckinSubtitle': 'This helps with day planning',
  'skipCheckin': 'Skip',
  'compassionModeTitle': 'Not my day',
  'compassionModeSubtitle': 'XP penalty suppressed',
  'notMyDayButton': 'Not my day',
  'absenceTypeSick': 'Sick',
  'absenceTypeVacation': 'Vacation',
  'addTask': 'Add task',
  'editTask': 'Edit task',
  'deleteTask': 'Delete task',
  'completeTask': 'Complete task',
  'reopenTask': 'Reopen task',
  'moveToTomorrow': 'Move to tomorrow',
  'taskText': 'Task',
  'taskTextHint': 'What do you want to accomplish?',
  'taskDeadline': 'Deadline',
  'taskScheduledDate': 'Date',
  'taskScheduledTime': 'Time of day',
  'taskEstimatedMinutes': 'Estimated duration (min)',
  'taskTags': 'Tags',
  'taskCategory': 'Category',
  'taskEnergyCost': 'Energy cost',
  'taskPriority': 'Priority',
  'subtaskAdd': 'Add subtask',
  'subtaskPlaceholder': 'New subtask…',
  'scheduledTimeMorning': 'Morning',
  'scheduledTimeAfternoon': 'Afternoon',
  'scheduledTimeEvening': 'Evening',
  'scheduledTimeExact': 'Exact',
  'focusTimerTitle': 'Focus Timer',
  'focusTimerStart': 'Start',
  'focusTimerPause': 'Pause',
  'focusTimerStop': 'Stop',
  'focusTimerDone': 'Focus session complete!',
  'focusTimerFlowDetected': 'Flow mode active – keep going!',
  'focusTimerSelectTask': 'Select task',
  'plannerTitle': 'Planner',
  'plannerWeekView': 'Week',
  'plannerMonthView': 'Month',
  'achievementsTitle': 'Achievements',
  'achievementsStreak': '{days} day streak',
  'achievementsLocked': 'Not yet unlocked',
  'achievementsUnlocked': 'Unlocked',
  'mailTitle': 'Mail',
  'mailNoConfig': 'No IMAP connection configured',
  'mailConfigureButton': 'Configure IMAP',
  'mailConvertToTask': 'Save as task',
  'mailMarkImportant': 'Important',
  'mailMarkTodo': 'Todo',
  'mailMarkWaiting': 'Waiting',
  'mailMarkDone': 'Done',
  'mailDelete': 'Delete',
  'mailInbox': 'Inbox',
  'settingsTitle': 'Settings',
  'settingsTheme': 'Theme',
  'settingsThemeDark': 'Dark',
  'settingsThemeLight': 'Light',
  'settingsThemeSystem': 'System',
  'settingsLanguage': 'Language',
  'settingsLanguageDe': 'German',
  'settingsLanguageEn': 'English',
  'settingsAssistanceWindow': 'Work Window',
  'settingsWorkStart': 'Start',
  'settingsWorkEnd': 'End',
  'settingsActiveDays': 'Active days',
  'settingsGamification': 'Gamification',
  'settingsXpEnabled': 'XP enabled',
  'settingsConfettiEnabled': 'Confetti effect',
  'settingsSoundEnabled': 'Sounds',
  'settingsImap': 'IMAP Settings',
  'settingsImapHost': 'Host',
  'settingsImapPort': 'Port',
  'settingsImapUser': 'User',
  'settingsImapPassword': 'Password',
  'settingsImapTls': 'Use TLS',
  'settingsImapSave': 'Save',
  'settingsImapTest': 'Test connection',
  'settingsCalendar': 'Calendar',
  'settingsCalendarPermission': 'Grant calendar permission',
  'settingsCalendarNone': 'No calendars selected',
  'settingsBackup': 'Backup',
  'settingsExport': 'Export data',
  'settingsImport': 'Import data',
  'settingsImportSuccess': 'Import successful',
  'settingsImportError': 'Import failed',
  'settingsSizeMappings': 'Size estimates',
  'settingsSizeQuick': 'Quick',
  'settingsSizeShort': 'Short',
  'settingsSizeMedium': 'Medium',
  'settingsSizeLong': 'Long',
  'confirmDelete': 'Confirm deletion',
  'confirmDeleteMessage': 'Really delete this task?',
  'cancel': 'Cancel',
  'confirm': 'Confirm',
  'save': 'Save',
  'close': 'Close',
  'done': 'Done',
  'edit': 'Edit',
  'delete': 'Delete',
  'add': 'Add',
  'overdue': 'Overdue',
  'dueSoon': 'Due soon',
  'dueToday': 'Due today',
  'calendarPermissionRequired': 'Calendar permission required',
  'calendarPermissionMessage': 'Please grant the app access to your calendar in Settings.',
  'calendarGrantPermission': 'Grant permission',
  'weekDayMon': 'Mon',
  'weekDayTue': 'Tue',
  'weekDayWed': 'Wed',
  'weekDayThu': 'Thu',
  'weekDayFri': 'Fri',
  'weekDaySat': 'Sat',
  'weekDaySun': 'Sun',
  'statsWeeklyCompleted': 'Completed this week',
  'statsTotalFocusTime': 'Total focus time',
  'statsCompletedThisMonth': 'Completed this month',
  'statsFilter': 'Time range',
  'statsFilterWeek': 'Week',
  'statsFilterMonth': 'Month',
  'statsFilterYear': 'Year',
  'notificationDeadlineTitle': 'Deadline tomorrow',
  'notificationDeadlineBody': 'Task "{title}" is due tomorrow.',
  'notificationFocusTitle': 'Focus session complete!',
  'notificationFocusBody': '+20 XP for your focus session.',
};
