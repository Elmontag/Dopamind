import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getJson, setJson } from '../storage/storage';

const STORAGE_KEY = 'dopamind-resource-monitor';
const LEGACY_KEY = 'dopamind-timetracking';

interface FocusBlock { start: number; end: number }
interface Interaction { ts: number; type: string }

interface TodaySession {
  date: string;
  firstActivity: number;
  lastActivity: number;
  focusBlocks: FocusBlock[];
  tasksCompleted: number;
  impliedBreaks: { start: number; end: number }[];
  interactions: Interaction[];
}

interface ActivitySession {
  id?: string;
  date: string;
  firstActivity: number;
  lastActivity: number;
  focusBlocks: FocusBlock[];
  tasksCompleted: number;
  impliedBreaks: { start: number; end: number }[];
}

interface AbsenceMode {
  type: 'sick' | 'vacation';
  startDate: string;
  endDate?: string;
  note: string;
}

interface AbsenceRecord extends AbsenceMode {
  id: string;
}

interface PendingTriage {
  returnDate: string;
  absenceType: string;
  startDate: string;
}

interface ResourceMonitorState {
  activitySessions: ActivitySession[];
  todaySession: TodaySession | null;
  absenceMode: AbsenceMode | null;
  absenceHistory: AbsenceRecord[];
  pendingTriage: PendingTriage | null;
  legacyEntries: unknown[];
}

const initialState: ResourceMonitorState = {
  activitySessions: [],
  todaySession: null,
  absenceMode: null,
  absenceHistory: [],
  pendingTriage: null,
  legacyEntries: [],
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function migrateLegacyState(legacy: Record<string, unknown>): Partial<ResourceMonitorState> {
  if (!legacy) return {};
  const migrated: Partial<ResourceMonitorState> = {};
  const entries = legacy.entries as Array<Record<string, unknown>> | undefined;
  if (entries && entries.length > 0) {
    migrated.activitySessions = entries.map((e) => ({
      id: e.id as string,
      date: e.date as string,
      firstActivity: e.clockIn as number,
      lastActivity: e.clockOut as number,
      focusBlocks: [],
      tasksCompleted: 0,
      impliedBreaks: ((e.breaks as Array<{ start: number; end: number }>) || []).filter((b) => b.start && b.end),
    }));
    migrated.legacyEntries = entries;
  }
  const absences = legacy.absences as Array<Record<string, unknown>> | undefined;
  if (absences && absences.length > 0) {
    migrated.absenceHistory = absences.map((a) => ({
      id: a.id as string,
      type: (a.type as 'sick' | 'vacation'),
      startDate: (a.startDate || a.date) as string,
      endDate: (a.endDate || a.date) as string,
      note: (a.note || '') as string,
    }));
  }
  return migrated;
}

type Action =
  | { type: 'RECORD_ACTIVITY'; payload?: { interactionType?: string } }
  | { type: 'RECORD_FOCUS_BLOCK'; payload: FocusBlock }
  | { type: 'ACTIVATE_SICK_MODE'; payload?: { note?: string } }
  | { type: 'ACTIVATE_VACATION_MODE'; payload: { startDate: string; endDate: string; note?: string } }
  | { type: 'DEACTIVATE_ABSENCE' }
  | { type: 'DISMISS_TRIAGE' }
  | { type: 'DELETE_ABSENCE_HISTORY'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<ResourceMonitorState> };

function reducer(state: ResourceMonitorState, action: Action): ResourceMonitorState {
  switch (action.type) {
    case 'RECORD_ACTIVITY': {
      const now = Date.now();
      const today = todayStr();
      const interactionType = action.payload?.interactionType || 'generic';
      if (state.todaySession && state.todaySession.date === today) {
        const interactions = [...(state.todaySession.interactions || []), { ts: now, type: interactionType }];
        const impliedBreaks: { start: number; end: number }[] = [];
        for (let i = 1; i < interactions.length; i++) {
          const gap = interactions[i].ts - interactions[i - 1].ts;
          if (gap > 5 * 60000) {
            impliedBreaks.push({ start: interactions[i - 1].ts, end: interactions[i].ts });
          }
        }
        return {
          ...state,
          todaySession: {
            ...state.todaySession,
            lastActivity: now,
            interactions,
            impliedBreaks,
            tasksCompleted:
              interactionType === 'taskComplete'
                ? (state.todaySession.tasksCompleted || 0) + 1
                : state.todaySession.tasksCompleted || 0,
          },
        };
      }
      let sessions = state.activitySessions;
      if (state.todaySession && state.todaySession.date !== today) {
        const { interactions: _i, ...sessionData } = state.todaySession;
        sessions = [sessionData, ...sessions];
      }
      return {
        ...state,
        activitySessions: sessions,
        todaySession: {
          date: today,
          firstActivity: now,
          lastActivity: now,
          focusBlocks: [],
          tasksCompleted: interactionType === 'taskComplete' ? 1 : 0,
          impliedBreaks: [],
          interactions: [{ ts: now, type: interactionType }],
        },
      };
    }

    case 'RECORD_FOCUS_BLOCK': {
      if (!state.todaySession) return state;
      const block = action.payload;
      return {
        ...state,
        todaySession: {
          ...state.todaySession,
          focusBlocks: [...(state.todaySession.focusBlocks || []), block],
          lastActivity: Math.max(state.todaySession.lastActivity, block.end || Date.now()),
        },
      };
    }

    case 'ACTIVATE_SICK_MODE':
      if (state.absenceMode) return state;
      return { ...state, absenceMode: { type: 'sick', startDate: todayStr(), note: action.payload?.note || '' } };

    case 'ACTIVATE_VACATION_MODE':
      if (state.absenceMode) return state;
      return {
        ...state,
        absenceMode: { type: 'vacation', startDate: action.payload.startDate, endDate: action.payload.endDate, note: action.payload.note || '' },
      };

    case 'DEACTIVATE_ABSENCE': {
      if (!state.absenceMode) return state;
      const ended: AbsenceRecord = {
        id: Date.now().toString(36),
        ...state.absenceMode,
        endDate: state.absenceMode.endDate || todayStr(),
      };
      return {
        ...state,
        absenceMode: null,
        absenceHistory: [ended, ...state.absenceHistory],
        pendingTriage: { returnDate: todayStr(), absenceType: ended.type, startDate: ended.startDate },
      };
    }

    case 'DISMISS_TRIAGE':
      return { ...state, pendingTriage: null };

    case 'DELETE_ABSENCE_HISTORY':
      return { ...state, absenceHistory: state.absenceHistory.filter((a) => a.id !== action.payload) };

    case 'LOAD_STATE':
      return { ...initialState, ...action.payload };

    default:
      return state;
  }
}

interface ResourceMonitorContextValue {
  state: ResourceMonitorState;
  dispatch: (action: Action) => void;
  recordActivity: (interactionType?: string) => void;
  recordFocusBlock: (block: FocusBlock) => void;
  isAbsent: boolean;
  isSick: boolean;
  isOnVacation: boolean;
  hasPendingTriage: boolean;
  getTodayActivity: () => TodaySession | null;
}

const ResourceMonitorContext = createContext<ResourceMonitorContextValue | null>(null);

export function ResourceMonitorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        const saved = await getJson<Partial<ResourceMonitorState> | null>(STORAGE_KEY, null);
        if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
          dispatch({ type: 'LOAD_STATE', payload: saved });
          return;
        }
        const legacy = await getJson<Record<string, unknown> | null>(LEGACY_KEY, null);
        if (legacy) {
          const migrated = migrateLegacyState(legacy);
          if (Object.keys(migrated).length > 0) {
            dispatch({ type: 'LOAD_STATE', payload: migrated });
          }
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setJson(STORAGE_KEY, state).catch(() => {});
    }, 500);
  }, [state]);

  // Auto-check vacation end
  useEffect(() => {
    if (state.absenceMode?.type === 'vacation' && state.absenceMode.endDate) {
      if (todayStr() > state.absenceMode.endDate) {
        dispatch({ type: 'DEACTIVATE_ABSENCE' });
      }
    }
  }, [state.absenceMode]);

  const recordActivity = useCallback((interactionType?: string) => {
    if (state.absenceMode) return;
    dispatch({ type: 'RECORD_ACTIVITY', payload: { interactionType } });
  }, [state.absenceMode]);

  const recordFocusBlock = useCallback((block: FocusBlock) => {
    dispatch({ type: 'RECORD_FOCUS_BLOCK', payload: block });
  }, []);

  const isAbsent = !!state.absenceMode;
  const isSick = state.absenceMode?.type === 'sick';
  const isOnVacation = state.absenceMode?.type === 'vacation';
  const hasPendingTriage = !!state.pendingTriage;

  const getTodayActivity = useCallback((): TodaySession | null => {
    if (!state.todaySession || state.todaySession.date !== todayStr()) return null;
    return state.todaySession;
  }, [state.todaySession]);

  return (
    <ResourceMonitorContext.Provider
      value={{ state, dispatch, recordActivity, recordFocusBlock, isAbsent, isSick, isOnVacation, hasPendingTriage, getTodayActivity }}
    >
      {children}
    </ResourceMonitorContext.Provider>
  );
}

export const useResourceMonitor = (): ResourceMonitorContextValue => {
  const ctx = useContext(ResourceMonitorContext);
  if (!ctx) throw new Error('useResourceMonitor must be used within ResourceMonitorProvider');
  return ctx;
};
