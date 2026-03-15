import '../../data/models/user_stats.dart';

/// Handles daily streak calculation and reset logic.
class StreakService {
  const StreakService();

  /// Returns updated [UserStats] with streak recalculated for today.
  ///
  /// Call this once per day when the app opens.
  UserStats recalculate(UserStats stats) {
    final today = _dateStr(DateTime.now());
    final yesterday = _dateStr(
      DateTime.now().subtract(const Duration(days: 1)),
    );

    if (stats.lastCompletedDate == null) {
      // No tasks ever completed – reset to 0
      return stats.copyWith(currentStreakDays: 0);
    }

    if (stats.lastCompletedDate == today) {
      // Already updated today – ensure we don't double-count
      return stats;
    }

    if (stats.lastCompletedDate == yesterday) {
      // Streak continues – don't increment yet (increment on completion)
      return stats;
    }

    // More than one day missed – break streak (unless compassion mode)
    if (stats.isCompassionModeActive) {
      return stats;
    }

    return stats.copyWith(currentStreakDays: 0);
  }

  /// Increments streak after the first task of the day is completed.
  UserStats onTaskCompleted(UserStats stats) {
    final today = _dateStr(DateTime.now());
    final yesterday = _dateStr(
      DateTime.now().subtract(const Duration(days: 1)),
    );

    int newStreak;
    if (stats.lastCompletedDate == today) {
      // Already completed something today – no change
      newStreak = stats.currentStreakDays;
    } else if (stats.lastCompletedDate == yesterday ||
        stats.currentStreakDays == 0) {
      // First completion today, continuing streak
      newStreak = stats.currentStreakDays + 1;
    } else {
      // Missed days – start fresh
      newStreak = 1;
    }

    final longestStreak =
        newStreak > stats.longestStreak ? newStreak : stats.longestStreak;

    return stats.copyWith(
      currentStreakDays: newStreak,
      longestStreak: longestStreak,
    );
  }

  static String _dateStr(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}
