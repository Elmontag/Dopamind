import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { getJson, setJson } from '../storage/storage';
import { CalendarEvent } from '../types';

const STORAGE_KEY = 'dopamind-calendar';

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  view: string;
}

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
  selectedDate: (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })(),
  view: 'month',
};

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_VIEW'; payload: string };

function reducer(state: CalendarState, action: Action): CalendarState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload, loading: false };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) => e.id === action.payload.id ? { ...e, ...action.payload } : e),
      };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter((e) => e.id !== action.payload) };
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    default:
      return state;
  }
}

interface CalendarContextValue {
  state: CalendarState;
  dispatch: (action: Action) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsForDate: (date: string) => CalendarEvent[];
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load events from AsyncStorage on mount
  useEffect(() => {
    getJson<CalendarEvent[]>(STORAGE_KEY, []).then((events) => {
      if (Array.isArray(events) && events.length > 0) {
        dispatch({ type: 'SET_EVENTS', payload: events });
      }
    });
  }, []);

  // Persist events on change
  useEffect(() => {
    setJson(STORAGE_KEY, state.events).catch(() => {});
  }, [state.events]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const created: CalendarEvent = {
      ...event,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    };
    dispatch({ type: 'ADD_EVENT', payload: created });
    return created;
  }, []);

  const updateEvent = useCallback(async (event: CalendarEvent): Promise<void> => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
  }, []);

  const getEventsForDate = useCallback(
    (date: string): CalendarEvent[] =>
      state.events.filter((e) => (e.date || e.start?.slice(0, 10)) === date),
    [state.events],
  );

  return (
    <CalendarContext.Provider value={{ state, dispatch, addEvent, updateEvent, deleteEvent, getEventsForDate }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = (): CalendarContextValue => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
};
