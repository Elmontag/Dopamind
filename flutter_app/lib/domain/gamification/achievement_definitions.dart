/// Definitions for all 25+ achievements.
///
/// Ported 1:1 from AppContext.js ACHIEVEMENTS array.
class AchievementDefinition {
  const AchievementDefinition({
    required this.id,
    required this.size,
    required this.xp,
    required this.titleDe,
    required this.titleEn,
    required this.descDe,
    required this.descEn,
  });

  final String id;

  /// 'small' | 'medium' | 'large'
  final String size;

  /// XP reward when unlocked.
  final int xp;
  final String titleDe;
  final String titleEn;
  final String descDe;
  final String descEn;
}

const List<AchievementDefinition> kAchievements = [
  // ── Small (25–75 XP) ───────────────────────────────────────────────────────
  AchievementDefinition(
    id: 'first-task',
    size: 'small',
    xp: 25,
    titleDe: 'Erste Aufgabe',
    titleEn: 'First Task',
    descDe: 'Erste Aufgabe abgeschlossen',
    descEn: 'Completed your first task',
  ),
  AchievementDefinition(
    id: 'first-focus',
    size: 'small',
    xp: 25,
    titleDe: 'Erste Fokus-Session',
    titleEn: 'First Focus',
    descDe: 'Erste Fokus-Session abgeschlossen',
    descEn: 'Completed your first focus session',
  ),
  AchievementDefinition(
    id: 'early-bird',
    size: 'small',
    xp: 30,
    titleDe: 'Frühaufsteher',
    titleEn: 'Early Bird',
    descDe: 'Aufgabe vor 9 Uhr erledigt',
    descEn: 'Completed a task before 9 AM',
  ),
  AchievementDefinition(
    id: 'night-owl',
    size: 'small',
    xp: 30,
    titleDe: 'Nachteule',
    titleEn: 'Night Owl',
    descDe: 'Aufgabe nach 22 Uhr erledigt',
    descEn: 'Completed a task after 10 PM',
  ),
  AchievementDefinition(
    id: 'hat-trick',
    size: 'small',
    xp: 50,
    titleDe: 'Hattrick',
    titleEn: 'Hat Trick',
    descDe: '3 Aufgaben an einem Tag erledigt',
    descEn: 'Completed 3 tasks in one day',
  ),
  AchievementDefinition(
    id: 'focus-duo',
    size: 'small',
    xp: 40,
    titleDe: 'Fokus-Duo',
    titleEn: 'Focus Duo',
    descDe: '2 Fokus-Sessions an einem Tag',
    descEn: '2 focus sessions in one day',
  ),
  AchievementDefinition(
    id: 'quick-starter',
    size: 'small',
    xp: 35,
    titleDe: 'Schnellstarter',
    titleEn: 'Quick Starter',
    descDe: 'Aufgabe innerhalb 30 min nach Erstellung erledigt',
    descEn: 'Completed a task within 30 min of creating it',
  ),
  AchievementDefinition(
    id: 'subtask-master',
    size: 'small',
    xp: 45,
    titleDe: 'Subtask-Meister',
    titleEn: 'Subtask Master',
    descDe: 'Alle Teilaufgaben einer Aufgabe erledigt',
    descEn: 'Completed all subtasks of a task',
  ),

  // ── Medium (100–200 XP) ───────────────────────────────────────────────────
  AchievementDefinition(
    id: 'daily-5',
    size: 'medium',
    xp: 100,
    titleDe: 'Tägliche 5',
    titleEn: 'Daily 5',
    descDe: '5 Aufgaben an einem Tag erledigt',
    descEn: 'Completed 5 tasks in one day',
  ),
  AchievementDefinition(
    id: 'daily-10',
    size: 'medium',
    xp: 150,
    titleDe: 'Tägliche 10',
    titleEn: 'Daily 10',
    descDe: '10 Aufgaben an einem Tag erledigt',
    descEn: 'Completed 10 tasks in one day',
  ),
  AchievementDefinition(
    id: 'focus-hour',
    size: 'medium',
    xp: 100,
    titleDe: 'Fokus-Stunde',
    titleEn: 'Focus Hour',
    descDe: '60 min Fokuszeit an einem Tag',
    descEn: '60 minutes of focus time in one day',
  ),
  AchievementDefinition(
    id: 'week-warrior',
    size: 'medium',
    xp: 150,
    titleDe: 'Wochen-Krieger',
    titleEn: 'Week Warrior',
    descDe: '7 Tage in Folge aktiv',
    descEn: 'Active 7 days in a row',
  ),
  AchievementDefinition(
    id: 'streak-3',
    size: 'medium',
    xp: 100,
    titleDe: '3-Tage-Streak',
    titleEn: '3-Day Streak',
    descDe: '3 Tage Streak erreicht',
    descEn: 'Reached a 3-day streak',
  ),
  AchievementDefinition(
    id: 'streak-7',
    size: 'medium',
    xp: 175,
    titleDe: '7-Tage-Streak',
    titleEn: '7-Day Streak',
    descDe: '7 Tage Streak erreicht',
    descEn: 'Reached a 7-day streak',
  ),
  AchievementDefinition(
    id: 'deadline-hero',
    size: 'medium',
    xp: 125,
    titleDe: 'Deadline-Held',
    titleEn: 'Deadline Hero',
    descDe: '5 Aufgaben vor Deadline erledigt',
    descEn: 'Completed 5 tasks before their deadline',
  ),
  AchievementDefinition(
    id: 'focus-marathon',
    size: 'medium',
    xp: 150,
    titleDe: 'Fokus-Marathon',
    titleEn: 'Focus Marathon',
    descDe: '3 Fokus-Sessions an einem Tag',
    descEn: '3 focus sessions in one day',
  ),

  // ── Large (250–750 XP) ────────────────────────────────────────────────────
  AchievementDefinition(
    id: 'streak-30',
    size: 'large',
    xp: 500,
    titleDe: '30-Tage-Streak',
    titleEn: '30-Day Streak',
    descDe: '30 Tage Streak erreicht',
    descEn: 'Reached a 30-day streak',
  ),
  AchievementDefinition(
    id: 'streak-100',
    size: 'large',
    xp: 750,
    titleDe: '100-Tage-Streak',
    titleEn: '100-Day Streak',
    descDe: '100 Tage Streak erreicht',
    descEn: 'Reached a 100-day streak',
  ),
  AchievementDefinition(
    id: 'month-100',
    size: 'large',
    xp: 400,
    titleDe: '100 diesen Monat',
    titleEn: '100 This Month',
    descDe: '100 Aufgaben in einem Monat erledigt',
    descEn: 'Completed 100 tasks in a month',
  ),
  AchievementDefinition(
    id: 'year-365',
    size: 'large',
    xp: 750,
    titleDe: '365 dieses Jahr',
    titleEn: '365 This Year',
    descDe: '365 Aufgaben in einem Jahr erledigt',
    descEn: 'Completed 365 tasks in a year',
  ),
  AchievementDefinition(
    id: 'focus-1000min',
    size: 'large',
    xp: 500,
    titleDe: '1000 Fokus-Minuten',
    titleEn: '1000 Focus Minutes',
    descDe: '1000 Minuten Fokuszeit gesamt',
    descEn: 'Reached 1000 total focus minutes',
  ),
  AchievementDefinition(
    id: 'week-50',
    size: 'large',
    xp: 300,
    titleDe: '50 diese Woche',
    titleEn: '50 This Week',
    descDe: '50 Aufgaben in einer Woche erledigt',
    descEn: 'Completed 50 tasks in one week',
  ),
  AchievementDefinition(
    id: 'level-10',
    size: 'large',
    xp: 250,
    titleDe: 'Level 10',
    titleEn: 'Level 10',
    descDe: 'Level 10 erreicht',
    descEn: 'Reached level 10',
  ),
  AchievementDefinition(
    id: 'level-25',
    size: 'large',
    xp: 500,
    titleDe: 'Level 25',
    titleEn: 'Level 25',
    descDe: 'Level 25 erreicht',
    descEn: 'Reached level 25',
  ),
  AchievementDefinition(
    id: 'level-50',
    size: 'large',
    xp: 750,
    titleDe: 'Level 50',
    titleEn: 'Level 50',
    descDe: 'Level 50 erreicht',
    descEn: 'Reached level 50',
  ),
  AchievementDefinition(
    id: 'daily-champion',
    size: 'large',
    xp: 500,
    titleDe: 'Tages-Champion',
    titleEn: 'Daily Champion',
    descDe: '20 Aufgaben an einem Tag erledigt',
    descEn: 'Completed 20 tasks in one day',
  ),
];

/// Looks up an achievement by ID.
AchievementDefinition? findAchievement(String id) {
  try {
    return kAchievements.firstWhere((a) => a.id == id);
  } catch (_) {
    return null;
  }
}
