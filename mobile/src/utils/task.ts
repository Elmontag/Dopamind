import { Task, TimeOfDay } from '../types';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
const ENERGY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

/**
 * Returns the single highest-priority, non-completed task for today.
 * Prefers tasks scheduled for today or with no scheduled date.
 * If energyLevel is provided, tasks matching the energy cost are preferred.
 */
export function getNextTask(
  tasks: Task[],
  todayStr: string,
  energyLevel: string | null,
): Task | null {
  const candidates = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.scheduledDate && t.scheduledDate !== todayStr) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    // Priority first
    const pA = PRIORITY_ORDER[a.priority] ?? 1;
    const pB = PRIORITY_ORDER[b.priority] ?? 1;
    if (pA !== pB) return pA - pB;

    // Energy match second (if energy level provided)
    if (energyLevel) {
      const eMatch = (t: Task) => t.energyCost === energyLevel ? 0 : 1;
      const em = eMatch(a) - eMatch(b);
      if (em !== 0) return em;
    }

    // Deadline proximity third
    if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1;
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    return 0;
  });

  return candidates[0] ?? null;
}

/**
 * Returns tasks assigned to a specific time-of-day block on the given date.
 */
export function getTasksForTimeBlock(
  tasks: Task[],
  timeOfDay: TimeOfDay,
  date: string,
): Task[] {
  return tasks.filter((t) => {
    if (t.completed) return false;
    if (t.timeOfDay !== timeOfDay) return false;
    if (t.scheduledDate && t.scheduledDate !== date) return false;
    return true;
  });
}
