import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import * as calendarService from "../services/calendarService";
import { addOfflineCalendarEvent, getOfflineCalendarEvents } from "../services/offlineQueue";

const CalendarContext = createContext();
const CACHE_KEY = "dopamind-calendar-cache";

const initialState = {
  events: [],
  loading: false,
  error: null,
  selectedDate: (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; })(),
  view: "month",
  fetched: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_EVENTS":
      return { ...state, events: action.payload, loading: false, fetched: true };
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      };
    case "DELETE_EVENT":
      return { ...state, events: state.events.filter((e) => e.id !== action.payload) };
    case "SET_DATE":
      return { ...state, selectedDate: action.payload };
    case "SET_VIEW":
      return { ...state, view: action.payload };
    default:
      return state;
  }
}

export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchEvents = useCallback(async (start, end) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      if (!navigator.onLine) {
        // Offline: load from cache + offline events
        const cached = getCachedEvents();
        const offlineEvents = getOfflineCalendarEvents();
        dispatch({ type: "SET_EVENTS", payload: [...cached, ...offlineEvents] });
        return;
      }
      const events = await calendarService.fetchEvents(start, end);
      dispatch({ type: "SET_EVENTS", payload: events });
      // Cache for offline use
      cacheEvents(events);
    } catch (err) {
      // On network error, fall back to cache
      const cached = getCachedEvents();
      const offlineEvents = getOfflineCalendarEvents();
      if (cached.length > 0 || offlineEvents.length > 0) {
        dispatch({ type: "SET_EVENTS", payload: [...cached, ...offlineEvents] });
      } else {
        dispatch({ type: "SET_ERROR", payload: err.message });
      }
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (event) => {
    if (!navigator.onLine) {
      // Offline: store locally for later upload
      const updatedOffline = addOfflineCalendarEvent(event);
      const offlineEvent = updatedOffline[updatedOffline.length - 1];
      dispatch({ type: "ADD_EVENT", payload: offlineEvent });
      return offlineEvent;
    }
    try {
      const created = await calendarService.createEvent(event);
      dispatch({ type: "ADD_EVENT", payload: created });
      return created;
    } catch (err) {
      // Network error during create → save offline
      const updatedOffline = addOfflineCalendarEvent(event);
      const offlineEvent = updatedOffline[updatedOffline.length - 1];
      dispatch({ type: "ADD_EVENT", payload: offlineEvent });
      return offlineEvent;
    }
  }, []);

  const updateEvent = useCallback(async (event) => {
    if (!navigator.onLine) {
      // Offline: update locally only, no offline queue for CalDAV updates
      dispatch({ type: "UPDATE_EVENT", payload: event });
      return;
    }
    try {
      await calendarService.updateEvent(event);
      dispatch({ type: "UPDATE_EVENT", payload: event });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  const deleteEvent = useCallback(async (id) => {
    if (!navigator.onLine) {
      // Offline: remove from local view only
      dispatch({ type: "DELETE_EVENT", payload: id });
      return;
    }
    try {
      await calendarService.deleteEvent(id);
      dispatch({ type: "DELETE_EVENT", payload: id });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  const getEventsForDate = useCallback(
    (date) => state.events.filter((e) => (e.date || e.start?.slice(0, 10)) === date),
    [state.events]
  );

  return (
    <CalendarContext.Provider
      value={{ state, dispatch, fetchEvents, addEvent, updateEvent, deleteEvent, getEventsForDate }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => useContext(CalendarContext);

// --- Cache helpers ---

function cacheEvents(events) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(events));
  } catch {}
}

function getCachedEvents() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  } catch {
    return [];
  }
}
