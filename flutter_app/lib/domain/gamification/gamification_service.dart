import '../../data/models/task.dart';
import '../../data/models/user_stats.dart';
import 'achievement_definitions.dart';
import 'streak_service.dart';

/// XP / Level / Achievement business logic – ported from AppContext.js.
class GamificationService {
  const GamificationService();

  // ── Level calculation ──────────────────────────────────────────────────────

  /// XP required to be *in* level [level].
  /// Formula: 100 * level * (level + 1) / 2
  static int xpRequiredForLevel(int level) =>
      100 * level * (level + 1) ~/ 2;

  /// Derives the current level from total [xp].
  static int calculateLevel(int xp) {
    int level = 1;
    while (xpRequiredForLevel(level + 1) <= xp) {
      level++;
    }
    return level;
  }

  /// XP needed to reach the *next* level from the current one.
  static int xpToNextLevel(int currentLevel) =>
      xpRequiredForLevel(currentLevel + 1);

  // ── Level titles (DE/EN) ───────────────────────────────────────────────────

  static const Map<int, Map<String, String>> levelTitles = {
    1: {'de': 'Neuling', 'en': 'Newcomer'},
    2: {'de': 'Starter', 'en': 'Starter'},
    3: {'de': 'Routinier', 'en': 'Apprentice'},
    5: {'de': 'Fokus-Entdecker', 'en': 'Focus Explorer'},
    8: {'de': 'Aufgaben-Jäger', 'en': 'Task Hunter'},
    12: {'de': 'Flow-Meister', 'en': 'Flow Master'},
    18: {'de': 'Konzentrations-Ass', 'en': 'Concentration Ace'},
    25: {'de': 'Produktivitäts-Guru', 'en': 'Productivity Guru'},
    35: {'de': 'Dopamind-Veteran', 'en': 'Dopamind Veteran'},
    50: {'de': 'Legendarischer Fokus', 'en': 'Legendary Focus'},
  };

  static String getLevelTitle(int level, {String lang = 'de'}) {
    final thresholds = levelTitles.keys.toList()
      ..sort((a, b) => b.compareTo(a));
    for (final threshold in thresholds) {
      if (level >= threshold) {
        return levelTitles[threshold]![lang] ??
            levelTitles[threshold]!['de']!;
      }
    }
    return levelTitles[1]![lang] ?? levelTitles[1]!['de']!;
  }

  // ── Streak multiplier ──────────────────────────────────────────────────────

  static double getStreakMultiplier(int streakDays) {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.75;
    if (streakDays >= 7) return 1.5;
    if (streakDays >= 3) return 1.25;
    return 1.0;
  }

  // ── XP calculation ─────────────────────────────────────────────────────────

  /// Calculates XP gained for completing a task.
  static int calculateXpForTask(Task task, UserStats stats) {
    int baseXp;
    switch (task.priority) {
      case 'high':
        baseXp = 15;
        break;
      case 'low':
        baseXp = 7;
        break;
      default:
        baseXp = 10;
    }
    final multiplier = getStreakMultiplier(stats.currentStreakDays);
    return (baseXp * multiplier).round();
  }

  static const int xpPerSubtask = 5;
  static const int xpPerFocusSession = 20;

  // ── Achievement checking ───────────────────────────────────────────────────

  /// Returns the list of newly unlocked achievement IDs after a task
  /// completion event.
  List<String> checkTaskCompletionAchievements({
    required Task task,
    required UserStats stats,
    required List<Task> allTasks,
    required int subtasksCompleted,
  }) {
    final newlyUnlocked = <String>[];
    final unlocked = stats.unlockedAchievements.toSet();

    void tryUnlock(String id) {
      if (!unlocked.contains(id)) {
        unlocked.add(id);
        newlyUnlocked.add(id);
      }
    }

    // first-task
    if (stats.completedToday + 1 >= 1) tryUnlock('first-task');

    // hat-trick
    if (stats.completedToday + 1 >= 3) tryUnlock('hat-trick');

    // daily-5 / daily-10 / daily-champion
    final todayCount = stats.completedToday + 1;
    if (todayCount >= 5) tryUnlock('daily-5');
    if (todayCount >= 10) tryUnlock('daily-10');
    if (todayCount >= 20) tryUnlock('daily-champion');

    // week-50
    if (stats.completedThisWeek + 1 >= 50) tryUnlock('week-50');

    // month-100
    if (stats.completedThisMonth + 1 >= 100) tryUnlock('month-100');

    // year-365
    if (stats.completedThisYear + 1 >= 365) tryUnlock('year-365');

    // streak achievements
    final streak = stats.currentStreakDays;
    if (streak >= 3) tryUnlock('streak-3');
    if (streak >= 7) {
      tryUnlock('streak-7');
      tryUnlock('week-warrior');
    }
    if (streak >= 30) tryUnlock('streak-30');
    if (streak >= 100) tryUnlock('streak-100');

    // subtask-master
    if (subtasksCompleted > 0) tryUnlock('subtask-master');

    // deadline-hero: if task had a deadline and was completed on time
    if (task.deadline != null && !task.isOverdue) {
      // Count deadline-hero progress (simplified: any on-time completion)
      tryUnlock('deadline-hero');
    }

    // level achievements
    final newLevel = calculateLevel(stats.xp + calculateXpForTask(task, stats));
    if (newLevel >= 10) tryUnlock('level-10');
    if (newLevel >= 25) tryUnlock('level-25');
    if (newLevel >= 50) tryUnlock('level-50');

    // early-bird / night-owl
    final hour = DateTime.now().hour;
    if (hour < 9) tryUnlock('early-bird');
    if (hour >= 22) tryUnlock('night-owl');

    // quick-starter: completed within 30 minutes of creation
    if (task.createdAt != null) {
      final diff = DateTime.now().difference(task.createdAt!);
      if (diff.inMinutes <= 30) tryUnlock('quick-starter');
    }

    return newlyUnlocked;
  }

  /// Returns newly unlocked achievement IDs after a focus session.
  List<String> checkFocusAchievements({
    required UserStats stats,
    required int focusBlocksToday,
    required int sessionMinutes,
  }) {
    final newlyUnlocked = <String>[];
    final unlocked = stats.unlockedAchievements.toSet();

    void tryUnlock(String id) {
      if (!unlocked.contains(id)) {
        unlocked.add(id);
        newlyUnlocked.add(id);
      }
    }

    tryUnlock('first-focus');
    if (focusBlocksToday + 1 >= 2) tryUnlock('focus-duo');
    if (focusBlocksToday + 1 >= 3) tryUnlock('focus-marathon');

    // focus-hour: >= 60 min today
    // (caller should pass cumulative minutes; simplified here)
    if (stats.totalFocusMinutes + sessionMinutes >= 60) {
      tryUnlock('focus-hour');
    }

    if (stats.totalFocusMinutes + sessionMinutes >= 1000) {
      tryUnlock('focus-1000min');
    }

    return newlyUnlocked;
  }

  // ── Apply task completion to stats ─────────────────────────────────────────

  /// Returns the updated [UserStats] after completing [task].
  UserStats applyTaskCompletion(Task task, UserStats stats) {
    final xpGained = calculateXpForTask(task, stats);
    final newXp = stats.xp + xpGained;
    final newLevel = calculateLevel(newXp);
    final today = _dateStr(DateTime.now());

    return stats.copyWith(
      xp: newXp,
      level: newLevel,
      completedToday: stats.completedToday + 1,
      completedThisWeek: stats.completedThisWeek + 1,
      completedThisMonth: stats.completedThisMonth + 1,
      completedThisYear: stats.completedThisYear + 1,
      lastCompletedDate: today,
    );
  }

  /// Returns the updated [UserStats] after a focus session.
  UserStats applyFocusSession(int durationMinutes, UserStats stats) {
    final newXp = stats.xp + xpPerFocusSession;
    return stats.copyWith(
      xp: newXp,
      level: calculateLevel(newXp),
      totalFocusMinutes: stats.totalFocusMinutes + durationMinutes,
    );
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}
