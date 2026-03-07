import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

interface FocusTimerState {
  duration: number;
  secondsLeft: number;
  running: boolean;
  completed: boolean;
  flowDetected: boolean;
  activeTaskId: string | null;
  activeTaskText: string | null;
  activeTaskEstimated: number | null;
  activeTaskSize: string | null;
  taskElapsed: number;
  taskRunning: boolean;
  taskStartedAt: string | null;
}

const initialState: FocusTimerState = {
  duration: 25,
  secondsLeft: 25 * 60,
  running: false,
  completed: false,
  flowDetected: false,
  activeTaskId: null,
  activeTaskText: null,
  activeTaskEstimated: null,
  activeTaskSize: null,
  taskElapsed: 0,
  taskRunning: false,
  taskStartedAt: null,
};

type Action =
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' }
  | { type: 'SET_FLOW'; payload: boolean }
  | { type: 'START_TASK_TIMER'; payload: { id: string; text: string; estimatedMinutes?: number; sizeCategory?: string } }
  | { type: 'PAUSE_TASK_TIMER' }
  | { type: 'RESUME_TASK_TIMER' }
  | { type: 'STOP_TASK_TIMER' }
  | { type: 'TICK_TASK' };

function reducer(state: FocusTimerState, action: Action): FocusTimerState {
  switch (action.type) {
    case 'SET_DURATION':
      return { ...state, duration: action.payload, secondsLeft: action.payload * 60, completed: false, flowDetected: false };
    case 'TICK':
      return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
    case 'START':
      return { ...state, running: true, completed: false };
    case 'PAUSE':
      return { ...state, running: false };
    case 'COMPLETE':
      return { ...state, running: false, completed: true };
    case 'RESET':
      return { ...state, running: false, completed: false, secondsLeft: state.duration * 60, flowDetected: false };
    case 'SET_FLOW':
      return { ...state, flowDetected: action.payload };
    case 'START_TASK_TIMER':
      return {
        ...state,
        activeTaskId: action.payload.id,
        activeTaskText: action.payload.text,
        activeTaskEstimated: action.payload.estimatedMinutes || null,
        activeTaskSize: action.payload.sizeCategory || null,
        taskElapsed: 0,
        taskRunning: true,
        taskStartedAt: new Date().toISOString(),
      };
    case 'PAUSE_TASK_TIMER':
      return { ...state, taskRunning: false };
    case 'RESUME_TASK_TIMER':
      return { ...state, taskRunning: true };
    case 'STOP_TASK_TIMER':
      return { ...state, activeTaskId: null, activeTaskText: null, activeTaskEstimated: null, activeTaskSize: null, taskElapsed: 0, taskRunning: false, taskStartedAt: null };
    case 'TICK_TASK':
      return { ...state, taskElapsed: state.taskElapsed + 1 };
    default:
      return state;
  }
}

interface FocusTimerContextValue {
  state: FocusTimerState;
  dispatch: (action: Action) => void;
}

export function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.running && state.secondsLeft > 0) {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [state.running, state.secondsLeft]);

  useEffect(() => {
    if (state.taskRunning && state.activeTaskId) {
      taskIntervalRef.current = setInterval(() => dispatch({ type: 'TICK_TASK' }), 1000);
      return () => { if (taskIntervalRef.current) clearInterval(taskIntervalRef.current); };
    }
  }, [state.taskRunning, state.activeTaskId]);

  return (
    <FocusTimerContext.Provider value={{ state, dispatch }}>
      {children}
    </FocusTimerContext.Provider>
  );
}

export function useFocusTimer(): FocusTimerContextValue {
  const ctx = useContext(FocusTimerContext);
  if (!ctx) throw new Error('useFocusTimer must be used within FocusTimerProvider');
  return ctx;
}
