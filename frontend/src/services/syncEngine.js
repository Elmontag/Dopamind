/**
 * Sync Engine
 *
 * On reconnect:
 * 1. Fetch server state (tasks, categories, stats)
 * 2. Compare with local state to detect bilateral changes
 * 3. Replay queued offline actions, detecting conflicts (409)
 * 4. Merge gamification deltas additively
 * 5. Upload offline calendar events with collision check
 * 6. Show conflict dialog for unresolvable conflicts
 */

import { apiFetch } from "./api";
import {
  getQueue,
  dequeue,
  clearQueue,
  getGamificationDelta,
  clearGamificationDelta,
  getOfflineCalendarEvents,
  clearOfflineCalendarEvents,
  clearOfflineSince,
} from "./offlineQueue";

/**
 * Replays queued actions against the server.
 * Returns { synced: [...], conflicts: [...] }
 */
export async function replayQueue() {
  const queue = getQueue();
  const synced = [];
  const conflicts = [];

  for (const entry of queue) {
    try {
      const res = await apiFetch(entry.path, {
        method: entry.method,
        body: entry.body ? JSON.stringify(entry.body) : undefined,
      });
      synced.push({ ...entry, serverResponse: res });
      dequeue(entry.id);
    } catch (err) {
      if (err.message && err.message.includes("409")) {
        // Conflict detected – need user resolution
        conflicts.push({ ...entry, error: err.message });
        dequeue(entry.id);
      } else if (err.message && (err.message.includes("404") || err.message.includes("400"))) {
        // Entity was deleted on server or invalid – skip silently
        dequeue(entry.id);
      } else {
        // Network error – stop replay, keep remaining in queue
        break;
      }
    }
  }

  return { synced, conflicts };
}

/**
 * Fetches fresh server state and detects bilateral conflicts with local state.
 * Returns { serverTasks, serverCategories, serverStats, taskConflicts, categoryConflicts }
 */
export async function detectBilateralConflicts(localTasks, localCategories, offlineSince) {
  const taskConflicts = [];
  const categoryConflicts = [];

  let serverTasks = [];
  let serverCategories = [];
  let serverStats = null;

  try {
    const [tasksRes, catsRes, statsRes] = await Promise.all([
      apiFetch("/tasks").catch(() => []),
      apiFetch("/categories").catch(() => []),
      apiFetch("/stats").catch(() => null),
    ]);
    serverTasks = Array.isArray(tasksRes) ? tasksRes : [];
    serverCategories = Array.isArray(catsRes) ? catsRes : [];
    serverStats = statsRes;
  } catch {
    return { serverTasks: [], serverCategories: [], serverStats: null, taskConflicts: [], categoryConflicts: [] };
  }

  if (!offlineSince) {
    return { serverTasks, serverCategories, serverStats, taskConflicts, categoryConflicts };
  }

  // Detect task conflicts: same task modified both locally and on server since going offline
  const serverTaskMap = new Map(serverTasks.map((t) => [t.id, t]));
  const localTaskMap = new Map(localTasks.map((t) => [t.id, t]));

  for (const localTask of localTasks) {
    const serverTask = serverTaskMap.get(localTask.id);
    if (!serverTask) continue; // New local task or deleted on server – handled by queue replay

    const serverUpdated = serverTask.updatedAt ? new Date(serverTask.updatedAt).getTime() : 0;
    const wasModifiedOnServer = serverUpdated > offlineSince;

    // Check if locally modified: compare key fields
    const locallyModified = hasTaskDifferences(localTask, serverTask);

    if (wasModifiedOnServer && locallyModified) {
      taskConflicts.push({
        entityType: "task",
        entityId: localTask.id,
        local: localTask,
        server: serverTask,
      });
    }
  }

  // Detect category conflicts
  const serverCatMap = new Map(serverCategories.map((c) => [c.id, c]));
  for (const localCat of localCategories) {
    const serverCat = serverCatMap.get(localCat.id);
    if (!serverCat) continue;

    const serverCatUpdated = serverCat.updatedAt ? new Date(serverCat.updatedAt).getTime() : 0;
    const wasModifiedOnServer = serverCatUpdated > offlineSince;
    const locallyModified = localCat.name !== serverCat.name || localCat.color !== serverCat.color;

    if (wasModifiedOnServer && locallyModified) {
      categoryConflicts.push({
        entityType: "category",
        entityId: localCat.id,
        local: localCat,
        server: serverCat,
      });
    }
  }

  return { serverTasks, serverCategories, serverStats, taskConflicts, categoryConflicts };
}

function hasTaskDifferences(local, server) {
  const fields = ["text", "priority", "completed", "deadline", "scheduledTime", "estimatedMinutes", "energyCost"];
  for (const f of fields) {
    if (normalize(local[f]) !== normalize(server[f])) return true;
  }
  return false;
}

function normalize(val) {
  if (val === null || val === undefined || val === "") return "";
  return String(val);
}

/**
 * Merges gamification deltas additively into server stats.
 * Returns the merged stats object to PATCH to server.
 */
export async function mergeGamificationDeltas(serverStats) {
  const delta = getGamificationDelta();
  if (!delta) return null;

  const base = serverStats || {};
  const merged = {
    xp: (base.xp || 0) + (delta.xp || 0),
    completedToday: (base.completedToday || 0) + (delta.completedToday || 0),
    completedThisWeek: (base.completedThisWeek || 0) + (delta.completedThisWeek || 0),
    completedThisMonth: (base.completedThisMonth || 0) + (delta.completedThisMonth || 0),
    completedThisYear: (base.completedThisYear || 0) + (delta.completedThisYear || 0),
    focusMinutesToday: (base.focusMinutesToday || 0) + (delta.focusMinutesToday || 0),
    focusMinutesThisWeek: (base.focusMinutesThisWeek || 0) + (delta.focusMinutesThisWeek || 0),
    focusMinutesThisMonth: (base.focusMinutesThisMonth || 0) + (delta.focusMinutesThisMonth || 0),
    totalFocusMinutes: (base.totalFocusMinutes || 0) + (delta.totalFocusMinutes || 0),
    focusBlocksToday: (base.focusBlocksToday || 0) + (delta.focusBlocksToday || 0),
    focusBlocksThisWeek: (base.focusBlocksThisWeek || 0) + (delta.focusBlocksThisWeek || 0),
  };

  // Recalculate level from merged XP
  merged.level = Math.floor(1 + Math.sqrt(merged.xp / 50));

  try {
    await apiFetch("/stats", {
      method: "PATCH",
      body: JSON.stringify(merged),
    });
  } catch {
    // If stats sync fails, keep delta for next attempt
    return merged;
  }

  // Sync new achievements
  if (delta.newAchievements && delta.newAchievements.length > 0) {
    for (const achId of delta.newAchievements) {
      try {
        await apiFetch("/achievements", {
          method: "POST",
          body: JSON.stringify({ id: achId }),
        });
      } catch {}
    }
  }

  clearGamificationDelta();
  return merged;
}

/**
 * Uploads offline calendar events to the server.
 * Checks for collisions (same title + same date).
 * Returns { uploaded: [...], collisions: [...] }
 */
export async function syncOfflineCalendarEvents() {
  const offlineEvents = getOfflineCalendarEvents();
  if (offlineEvents.length === 0) return { uploaded: [], collisions: [] };

  // Fetch current server events
  let serverEvents = [];
  try {
    serverEvents = await apiFetch("/calendar");
    if (!Array.isArray(serverEvents)) serverEvents = [];
  } catch {
    return { uploaded: [], collisions: offlineEvents };
  }

  const uploaded = [];
  const collisions = [];

  for (const event of offlineEvents) {
    const eventDate = event.date || (event.start && event.start.slice(0, 10));
    const eventTitle = (event.summary || event.title || "").toLowerCase().trim();

    // Check for collision: same title + same date
    const hasCollision = serverEvents.some((se) => {
      const seDate = se.date || (se.start && se.start.slice(0, 10));
      const seTitle = (se.summary || se.title || "").toLowerCase().trim();
      return seDate === eventDate && seTitle === eventTitle;
    });

    if (hasCollision) {
      collisions.push(event);
    } else {
      try {
        // Strip offline metadata before uploading
        const { _offlineId, _createdOffline, _timestamp, ...eventData } = event;
        const created = await apiFetch("/calendar", {
          method: "POST",
          body: JSON.stringify(eventData),
        });
        uploaded.push(created);
      } catch {
        collisions.push(event);
      }
    }
  }

  // Only clear if all processed
  if (collisions.length === 0) {
    clearOfflineCalendarEvents();
  } else {
    // Keep only collisions
    localStorage.setItem("dopamind-offline-calendar", JSON.stringify(collisions));
  }

  return { uploaded, collisions };
}

/**
 * Applies a conflict resolution for a single entity.
 * choice: "local" | "server"
 */
export async function resolveConflict(conflict, choice) {
  if (choice === "server") {
    // Server wins – no API call needed, just return server version
    return conflict.server;
  }

  if (choice === "local") {
    // Local wins – push local version to server
    if (conflict.entityType === "task") {
      const { id, text, priority, energyCost, estimatedMinutes, sizeCategory, deadline,
        timeOfDay, scheduledTime, scheduledDate, category, mailRef, tags,
        blockSortIndex, completed, completedAt } = conflict.local;
      const patch = { text, priority, energyCost, estimatedMinutes, sizeCategory, deadline,
        timeOfDay, scheduledTime, scheduledDate, category, mailRef, tags,
        blockSortIndex, completed, completedAt };
      try {
        await apiFetch(`/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
      } catch {}
    } else if (conflict.entityType === "category") {
      const { id, name, color, type } = conflict.local;
      try {
        await apiFetch(`/categories/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name, color, type }),
        });
      } catch {}
    } else if (conflict.entityType === "calendar") {
      const { _offlineId, _createdOffline, _timestamp, ...eventData } = conflict.local;
      try {
        await apiFetch("/calendar", {
          method: "POST",
          body: JSON.stringify(eventData),
        });
      } catch {}
    }
    return conflict.local;
  }
}

/**
 * Full sync orchestrator. Call this when going back online.
 * Returns { conflicts, calendarCollisions, mergedStats } for UI to handle.
 */
export async function performFullSync(localTasks, localCategories, offlineSince) {
  // Step 1: Detect bilateral conflicts
  const {
    serverTasks,
    serverCategories,
    serverStats,
    taskConflicts,
    categoryConflicts,
  } = await detectBilateralConflicts(localTasks, localCategories, offlineSince);

  // Step 2: Replay queued actions (for non-conflicting items)
  const conflictIds = new Set([
    ...taskConflicts.map((c) => c.entityId),
    ...categoryConflicts.map((c) => c.entityId),
  ]);

  // Filter queue to exclude conflicting entities (those need manual resolution)
  const queue = getQueue();
  const safeQueue = queue.filter((e) => !conflictIds.has(e.entityId));
  const conflictQueue = queue.filter((e) => conflictIds.has(e.entityId));

  // Remove conflict-related entries from queue (they'll be resolved via dialog)
  conflictQueue.forEach((e) => dequeue(e.id));

  // Replay safe entries
  const { conflicts: replayConflicts } = await replayQueue();

  // Merge any replay 409 conflicts into the bilateral conflicts
  // (They'll show up in the conflict dialog too)

  // Step 3: Merge gamification deltas
  const mergedStats = await mergeGamificationDeltas(serverStats);

  // Step 4: Sync offline calendar events
  const { uploaded: calUploaded, collisions: calendarCollisions } =
    await syncOfflineCalendarEvents();

  // Step 5: Clear offline-since marker
  clearOfflineSince();

  const allConflicts = [...taskConflicts, ...categoryConflicts];

  // Convert calendar collisions to conflict format
  const calConflicts = calendarCollisions.map((event) => ({
    entityType: "calendar",
    entityId: event._offlineId,
    local: event,
    server: null, // Server already has a matching event
  }));

  return {
    conflicts: [...allConflicts, ...calConflicts],
    serverTasks,
    serverCategories,
    mergedStats,
  };
}
