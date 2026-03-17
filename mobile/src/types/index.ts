export type Priority = 'low' | 'medium' | 'high';
export type EnergyCost = 'low' | 'medium' | 'high';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
  estimatedMinutes: number;
  priority: Priority;
  energyCost: EnergyCost;
  deadline: string | null;
  tags: string[];
  scheduledTime?: string | null;
  scheduledDate?: string | null;
  timeOfDay?: TimeOfDay | null;
  category?: string | null;
  sizeCategory?: string | null;
}

export interface Task {
  id: string;
  text: string;
  priority: Priority;
  energyCost: EnergyCost;
  estimatedMinutes: number;
  sizeCategory: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: number;
  deadline: string | null;
  timeOfDay: TimeOfDay | null;
  scheduledTime: string | null;
  scheduledDate: string | null;
  category: string | null;
  tags: string[];
  subtasks: Subtask[];
  blockSortIndex?: number;
  mailRef?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

export interface Achievement {
  id: string;
  xp: number;
  size: 'small' | 'medium' | 'large';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  location?: string;
}

export interface DailyChallenge {
  id: string;
  type: 'complete_tasks' | 'focus_minutes';
  target: number;
}

export interface ActiveDailyChallenge {
  date: string;
  challengeId: string;
  completed: boolean;
  progress: number;
}

export interface Reward {
  id: number;
  type: string;
  messageKey?: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  achievementId?: string;
  xp?: number;
  level?: number;
  days?: number;
  daysOverdue?: number;
  varType?: string;
  timestamp: number;
}

export interface MicroConfettiItem {
  id: number | string;
  xp: number;
  type: string;
}

export interface XpLogEntry {
  date: string;
  amount: number;
  source: string;
}

export interface DailyCompletionEntry {
  date: string;
  tasks: number;
  focusMin: number;
  focusBlocks: number;
  energyLevel: string | null;
}

export interface FocusLogEntry {
  date: string;
  hour: number;
  minutes: number;
}

export interface TimeLogEntry {
  id: number | string;
  date: string;
  taskId: string;
  subtaskId?: string;
  sizeCategory?: string | null;
  estimatedMin: number;
  actualMin: number;
  startedAt: string | null;
  stoppedAt?: string;
}

export interface EnergyLogEntry {
  date: string;
  level: string;
  changedAt: string;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  xp: number;
  level: number;
  streak: number;
  completedToday: number;
  focusMinutesToday: number;
  rewards: Reward[];
  completedThisWeek: number;
  completedThisMonth: number;
  completedThisYear: number;
  focusMinutesThisWeek: number;
  focusMinutesThisMonth: number;
  focusBlocksToday: number;
  focusBlocksThisWeek: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  lastWeekReset: string | null;
  lastMonthReset: string | null;
  lastYearReset: string | null;
  unlockedAchievements: string[];
  deadlineHeroCount: number;
  totalFocusMinutes: number;
  penalizedTaskIds: string[];
  compassionModeDate: string | null;
  flowModeActive: boolean;
  energyLevel: string | null;
  energyCheckDate: string | null;
  energyLog: EnergyLogEntry[];
  notMyDayCount: number;
  dailyChallenge: ActiveDailyChallenge | null;
  previousWeekStats: { tasks: number; focusMinutes: number; xp: number; topDay: string | null } | null;
  focusLog: FocusLogEntry[];
  timeLog: TimeLogEntry[];
  lastWeeklyReport: string | null;
  microConfettiQueue: MicroConfettiItem[];
  xpLog: XpLogEntry[];
  dailyCompletionLog: DailyCompletionEntry[];
}
