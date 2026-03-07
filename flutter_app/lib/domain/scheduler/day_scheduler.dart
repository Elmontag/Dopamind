import '../../data/models/task.dart';

/// Represents one of the three energy-based day blocks.
enum DayBlock { morning, afternoon, evening }

extension DayBlockX on DayBlock {
  String get scheduledTimeKey {
    switch (this) {
      case DayBlock.morning:
        return 'morning';
      case DayBlock.afternoon:
        return 'afternoon';
      case DayBlock.evening:
        return 'evening';
    }
  }

  /// Preferred energy cost for tasks assigned to this block.
  String get preferredEnergyCost {
    switch (this) {
      case DayBlock.morning:
        return 'high';
      case DayBlock.afternoon:
        return 'medium';
      case DayBlock.evening:
        return 'low';
    }
  }

  /// Default start hour for this block.
  int get startHour {
    switch (this) {
      case DayBlock.morning:
        return 6;
      case DayBlock.afternoon:
        return 12;
      case DayBlock.evening:
        return 17;
    }
  }

  /// Default end hour for this block.
  int get endHour {
    switch (this) {
      case DayBlock.morning:
        return 12;
      case DayBlock.afternoon:
        return 17;
      case DayBlock.evening:
        return 22;
    }
  }
}

/// Result of scheduling: tasks assigned to each energy block.
class ScheduledDay {
  const ScheduledDay({
    required this.morning,
    required this.afternoon,
    required this.evening,
    this.nextTask,
  });

  final List<Task> morning;
  final List<Task> afternoon;
  final List<Task> evening;

  /// The single highest-priority next task across all blocks.
  final Task? nextTask;

  List<Task> forBlock(DayBlock block) {
    switch (block) {
      case DayBlock.morning:
        return morning;
      case DayBlock.afternoon:
        return afternoon;
      case DayBlock.evening:
        return evening;
    }
  }
}

/// Energy-aware day scheduler.
///
/// Assigns tasks to morning/afternoon/evening blocks based on:
///  - `scheduledTime` (explicit block preference)
///  - `energyCost` vs. block preference
///  - `priority` (high > medium > low)
///  - `deadline` (earlier = higher priority)
class DayScheduler {
  const DayScheduler();

  /// Schedule [tasks] into blocks for the current energy level.
  ///
  /// [dailyEnergy] is the user's today energy level: 'low' | 'normal' | 'high'.
  ScheduledDay schedule(
    List<Task> tasks, {
    String dailyEnergy = 'normal',
  }) {
    final incomplete = tasks.where((t) => !t.completed).toList();

    final morning = <Task>[];
    final afternoon = <Task>[];
    final evening = <Task>[];

    for (final task in incomplete) {
      final block = _assignBlock(task, dailyEnergy);
      switch (block) {
        case DayBlock.morning:
          morning.add(task);
          break;
        case DayBlock.afternoon:
          afternoon.add(task);
          break;
        case DayBlock.evening:
          evening.add(task);
          break;
      }
    }

    _sortBlock(morning);
    _sortBlock(afternoon);
    _sortBlock(evening);

    final nextTask = _pickNextTask([...morning, ...afternoon, ...evening]);

    return ScheduledDay(
      morning: morning,
      afternoon: afternoon,
      evening: evening,
      nextTask: nextTask,
    );
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  DayBlock _assignBlock(Task task, String dailyEnergy) {
    // Respect explicit scheduledTime
    if (task.scheduledTime != null) {
      switch (task.scheduledTime) {
        case 'morning':
          return DayBlock.morning;
        case 'afternoon':
          return DayBlock.afternoon;
        case 'evening':
          return DayBlock.evening;
      }
    }

    // Assign based on energyCost and dailyEnergy level
    final cost = task.energyCost;
    if (dailyEnergy == 'high') {
      // High energy day: push high-cost tasks to morning
      if (cost == 'high') return DayBlock.morning;
      if (cost == 'medium') return DayBlock.afternoon;
      return DayBlock.evening;
    } else if (dailyEnergy == 'low') {
      // Low energy day: spread tasks toward afternoon/evening
      if (cost == 'high') return DayBlock.afternoon;
      if (cost == 'medium') return DayBlock.afternoon;
      return DayBlock.evening;
    } else {
      // Normal energy
      if (cost == 'high') return DayBlock.morning;
      if (cost == 'medium') return DayBlock.afternoon;
      return DayBlock.evening;
    }
  }

  void _sortBlock(List<Task> tasks) {
    tasks.sort((a, b) {
      // Priority: high > medium > low
      final pa = _priorityScore(a.priority);
      final pb = _priorityScore(b.priority);
      if (pa != pb) return pb.compareTo(pa);

      // Deadline: earlier first
      if (a.deadline != null && b.deadline != null) {
        return a.deadline!.compareTo(b.deadline!);
      }
      if (a.deadline != null) return -1;
      if (b.deadline != null) return 1;

      return a.sortOrder.compareTo(b.sortOrder);
    });
  }

  /// Picks the single highest-priority, lowest-deadline task.
  Task? _pickNextTask(List<Task> tasks) {
    if (tasks.isEmpty) return null;
    return tasks.reduce((best, t) {
      final pb = _priorityScore(best.priority);
      final pt = _priorityScore(t.priority);
      if (pt > pb) return t;
      if (pt < pb) return best;
      // Same priority – prefer earlier deadline
      if (best.deadline == null && t.deadline != null) return t;
      if (best.deadline != null && t.deadline == null) return best;
      if (best.deadline != null && t.deadline != null) {
        return t.deadline!.compareTo(best.deadline!) < 0 ? t : best;
      }
      return best;
    });
  }

  static int _priorityScore(String priority) {
    switch (priority) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      default:
        return 1;
    }
  }
}
