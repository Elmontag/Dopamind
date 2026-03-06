/**
 * Offline Action Queue
 *
 * Queues failed API mutations (POST/PATCH/PUT/DELETE) when offline.
 * On reconnect, the sync engine replays them in order.
 *
 * Storage: localStorage key "dopamind-offline-queue"
 * Each entry: { id, timestamp, entityType, entityId, action, method, path, body }
 */

const QUEUE_KEY = "dopamind-offline-queue";
const GAMIFICATION_DELTA_KEY = "dopamind-offline-gamification-delta";
const CALENDAR_OFFLINE_KEY = "dopamind-offline-calendar";
const OFFLINE_SINCE_KEY = "dopamind-offline-since";

// --- Queue CRUD ---

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(entry) {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    ...entry,
  });
  saveQueue(queue);
}

export function dequeue(id) {
  const queue = getQueue().filter((e) => e.id !== id);
  saveQueue(queue);
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function hasQueuedActions() {
  return getQueue().length > 0;
}

// --- Gamification Delta Tracking ---

export function getGamificationDelta() {
  try {
    return JSON.parse(localStorage.getItem(GAMIFICATION_DELTA_KEY) || "null");
  } catch {
    return null;
  }
}

export function addGamificationDelta(field, amount) {
  const delta = getGamificationDelta() || {
    xp: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    completedThisYear: 0,
    focusMinutesToday: 0,
    focusMinutesThisWeek: 0,
    focusMinutesThisMonth: 0,
    totalFocusMinutes: 0,
    focusBlocksToday: 0,
    focusBlocksThisWeek: 0,
    newAchievements: [],
  };
  if (field === "newAchievements") {
    if (!delta.newAchievements.includes(amount)) {
      delta.newAchievements.push(amount);
    }
  } else {
    delta[field] = (delta[field] || 0) + amount;
  }
  localStorage.setItem(GAMIFICATION_DELTA_KEY, JSON.stringify(delta));
}

export function clearGamificationDelta() {
  localStorage.removeItem(GAMIFICATION_DELTA_KEY);
}

// --- Calendar Offline Fallback ---

export function getOfflineCalendarEvents() {
  try {
    return JSON.parse(localStorage.getItem(CALENDAR_OFFLINE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addOfflineCalendarEvent(event) {
  const events = getOfflineCalendarEvents();
  events.push({
    ...event,
    _offlineId: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    _createdOffline: true,
    _timestamp: Date.now(),
  });
  localStorage.setItem(CALENDAR_OFFLINE_KEY, JSON.stringify(events));
  return events;
}

export function clearOfflineCalendarEvents() {
  localStorage.removeItem(CALENDAR_OFFLINE_KEY);
}

// --- Offline-since timestamp ---

export function markOfflineSince() {
  if (!localStorage.getItem(OFFLINE_SINCE_KEY)) {
    localStorage.setItem(OFFLINE_SINCE_KEY, Date.now().toString());
  }
}

export function getOfflineSince() {
  const val = localStorage.getItem(OFFLINE_SINCE_KEY);
  return val ? parseInt(val, 10) : null;
}

export function clearOfflineSince() {
  localStorage.removeItem(OFFLINE_SINCE_KEY);
}
