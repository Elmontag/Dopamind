import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useApp } from "../context/AppContext";
import { useCalendar } from "../context/CalendarContext";
import { useTimeTracking } from "../context/TimeTrackingContext";
import { useSettings } from "../context/SettingsContext";
import {
  CheckCircle, Calendar, Plus,
  LogIn, LogOut, Coffee, AlertCircle, Clock, ChevronLeft, ChevronRight, Pencil, X, GripVertical,
} from "lucide-react";


function ClockWidget({ t }) {
  const { state, dispatch, getSessionMinutes, isOnBreak } = useTimeTracking();
  const isClockedIn = !!state.currentSession;

  const formatTime = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!isClockedIn) {
    return (
      <button
        onClick={() => dispatch({ type: "CLOCK_IN" })}
        className="glass-card p-4 w-full flex items-center gap-3 hover:bg-accent/5 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-white transition-colors">
          <LogIn className="w-5 h-5 text-success group-hover:text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">{t("timeTracking.clockIn")}</p>
          <p className="text-[10px] text-muted-light dark:text-muted-dark">{t("timeTracking.workHours")}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">{t("timeTracking.currentSession")}</span>
        </div>
        <span className="text-lg font-bold font-mono text-accent">{formatTime(getSessionMinutes())}</span>
      </div>
      <div className="flex gap-2">
        {isOnBreak ? (
          <button onClick={() => dispatch({ type: "END_BREAK" })} className="btn-ghost text-sm flex items-center gap-1.5 flex-1 justify-center">
            <LogIn className="w-3.5 h-3.5" /> {t("timeTracking.endBreak")}
          </button>
        ) : (
          <button onClick={() => dispatch({ type: "START_BREAK" })} className="btn-ghost text-sm flex items-center gap-1.5 flex-1 justify-center">
            <Coffee className="w-3.5 h-3.5" /> {t("timeTracking.break")}
          </button>
        )}
        <button onClick={() => dispatch({ type: "CLOCK_OUT" })} className="btn-ghost text-sm flex items-center gap-1.5 flex-1 justify-center text-danger hover:bg-danger/10">
          <LogOut className="w-3.5 h-3.5" /> {t("timeTracking.clockOut")}
        </button>
      </div>
    </div>
  );
}

function QuickAddTask({ t, onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("home.quickAdd")}
        className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
      />
      <button type="submit" className="btn-primary p-2"><Plus className="w-4 h-4" /></button>
    </form>
  );
}

function UnifiedDayTimeline({ t, events, tasks, settings, onCompleteTask, isTaskOverdue, onEditTask, onUpdateScheduledTime, isToday, isPastDay }) {
  const startH = parseInt(settings.workSchedule.start.split(":")[0], 10);
  const startM = parseInt(settings.workSchedule.start.split(":")[1] || "0", 10);
  const endH = parseInt(settings.workSchedule.end.split(":")[0], 10);
  const endM = parseInt(settings.workSchedule.end.split(":")[1] || "0", 10);
  const breakMin = settings.workSchedule.breakMinutes;
  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const STEP = 15; // 15-minute granularity

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleEditSave = (taskId) => {
    if (editText.trim()) {
      onEditTask(taskId, editText.trim());
    }
    setEditingTaskId(null);
  };

  // Helper: convert hour+min to total minutes from midnight
  const toMin = (h, m) => h * 60 + m;
  const startTotal = toMin(startH, startM);
  const endTotal = toMin(endH, endM);
  const totalSlotCount = Math.floor((endTotal - startTotal) / STEP);

  // Helper: format minute offset as HH:MM
  const fmtTime = (totalMin) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Build initial 15-min slots
  const isTimeOnly = (s) => /^\d{1,2}:\d{2}$/.test(s);
  const slots = [];
  for (let i = 0; i < totalSlotCount; i++) {
    const minOffset = startTotal + i * STEP;
    slots.push({ time: fmtTime(minOffset), minOffset, type: "free", spanSlots: 1 });
  }

  // Block slots occupied by calendar events
  for (const ev of events) {
    if (ev.allDay || !ev.start) continue;
    let evStartMin, evEndMin;
    if (isTimeOnly(ev.start)) {
      const [eh, em] = ev.start.split(":").map(Number);
      evStartMin = toMin(eh, em);
      if (ev.end && isTimeOnly(ev.end)) {
        const [eeh, eem] = ev.end.split(":").map(Number);
        evEndMin = toMin(eeh, eem);
      } else {
        evEndMin = evStartMin + 60;
      }
    } else {
      const sd = new Date(ev.start);
      if (isNaN(sd)) continue;
      evStartMin = toMin(sd.getHours(), sd.getMinutes());
      const ed = ev.end ? new Date(ev.end) : null;
      evEndMin = ed && !isNaN(ed) ? toMin(ed.getHours(), ed.getMinutes()) : evStartMin + 60;
    }
    // Mark slots that overlap
    const firstSlot = Math.max(0, Math.floor((evStartMin - startTotal) / STEP));
    const lastSlot = Math.min(totalSlotCount - 1, Math.ceil((evEndMin - startTotal) / STEP) - 1);
    let isFirst = true;
    for (let j = firstSlot; j <= lastSlot; j++) {
      if (slots[j].type === "free") {
        const timeRange = ev.start && ev.end ? `${ev.start}–${ev.end}` : "";
        slots[j].type = "event";
        slots[j].label = isFirst ? (ev.title || ev.summary) : "";
        slots[j].eventTime = isFirst ? timeRange : "";
        slots[j].eventContinuation = !isFirst;
        isFirst = false;
      }
    }
  }

  // --- Place tasks with scheduledTime into the timeline, using their actual duration ---
  const scheduledTasks = tasks.filter((tk) => tk.scheduledTime);
  const unscheduledTasks = tasks.filter((tk) => !tk.scheduledTime);

  const placeTaskInSlots = (task, startSlotIdx) => {
    const dur = task.estimatedMinutes || 25;
    const slotsNeeded = Math.max(1, Math.ceil(dur / STEP));
    // Find contiguous free slots starting from startSlotIdx
    let canPlace = true;
    const endIdx = Math.min(startSlotIdx + slotsNeeded, totalSlotCount);
    for (let j = startSlotIdx; j < endIdx; j++) {
      if (slots[j].type !== "free") { canPlace = false; break; }
    }
    if (!canPlace) {
      // Just place in the first slot
      if (slots[startSlotIdx]?.type === "free") {
        slots[startSlotIdx].type = "task";
        slots[startSlotIdx].task = task;
        slots[startSlotIdx].label = task.text;
        slots[startSlotIdx].priority = task.priority;
        slots[startSlotIdx].overdue = isTaskOverdue(task);
        slots[startSlotIdx].scheduled = !!task.scheduledTime;
        slots[startSlotIdx].spanSlots = 1;
        slots[startSlotIdx].durationMin = dur;
      }
      return;
    }
    // Mark first slot as the task
    slots[startSlotIdx].type = "task";
    slots[startSlotIdx].task = task;
    slots[startSlotIdx].label = task.text;
    slots[startSlotIdx].priority = task.priority;
    slots[startSlotIdx].overdue = isTaskOverdue(task);
    slots[startSlotIdx].scheduled = !!task.scheduledTime;
    slots[startSlotIdx].spanSlots = endIdx - startSlotIdx;
    slots[startSlotIdx].durationMin = dur;
    // Mark subsequent slots as continuation
    for (let j = startSlotIdx + 1; j < endIdx; j++) {
      slots[j].type = "task-cont";
      slots[j].parentIdx = startSlotIdx;
    }
  };

  for (const task of scheduledTasks) {
    const [th, tm] = task.scheduledTime.split(":").map(Number);
    const taskStartMin = toMin(th, tm || 0);
    // For today: hide tasks whose scheduled time is still in the future
    if (isToday && taskStartMin > toMin(nowH, nowM)) continue;
    const slotIdx = Math.max(0, Math.floor((taskStartMin - startTotal) / STEP));
    if (slotIdx < totalSlotCount && slots[slotIdx]?.type === "free") {
      placeTaskInSlots(task, slotIdx);
    }
  }

  // Fill remaining free slots with unscheduled tasks (duration-aware)
  const pendingTasks = [...unscheduledTasks];
  for (let i = 0; i < totalSlotCount && pendingTasks.length > 0; i++) {
    if (slots[i].type !== "free") continue;
    if (isToday) {
      const idx = pendingTasks.findIndex((task) => {
        if (!task.createdAt) return true;
        const created = new Date(task.createdAt);
        return toMin(created.getHours(), created.getMinutes()) <= slots[i].minOffset;
      });
      if (idx >= 0) {
        const [task] = pendingTasks.splice(idx, 1);
        placeTaskInSlots(task, i);
      }
    } else {
      const task = pendingTasks.shift();
      placeTaskInSlots(task, i);
    }
  }

  // Insert break in the middle — duration-aware
  if (breakMin > 0) {
    const breakSlots = Math.max(1, Math.ceil(breakMin / STEP));
    const midIdx = Math.floor(totalSlotCount / 2);
    // Find best position around middle for break
    let breakStart = midIdx;
    for (let i = midIdx; i >= 0; i--) {
      let fits = true;
      for (let j = i; j < Math.min(i + breakSlots, totalSlotCount); j++) {
        if (slots[j]?.type === "event") { fits = false; break; }
      }
      if (fits) { breakStart = i; break; }
    }
    // Insert break (overwrite free/task slots)
    for (let j = breakStart; j < Math.min(breakStart + breakSlots, totalSlotCount); j++) {
      const isFirst = j === breakStart;
      slots[j] = {
        ...slots[j],
        type: "break",
        label: isFirst ? `${breakMin}${t("common.min")} ${t("timeTracking.break")}` : "",
        breakContinuation: !isFirst,
        breakIdx: breakStart,
      };
    }
  }

  // --- Drag & drop handlers ---
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  };
  const handleDragLeave = () => setDragOverIdx(null);
  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); return; }
    const srcSlot = slots[dragIdx];
    if (srcSlot?.type === "task" && srcSlot.task) {
      const newTime = fmtTime(slots[targetIdx].minOffset);
      onUpdateScheduledTime(srcSlot.task.id, newTime);
    }
    // Breaks can also be dragged (just visual reorder for now)
    setDragIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  const isDraggable = (slot) => !isPastDay && (slot.type === "task" || slot.type === "break");

  // Filter out continuation slots for rendering (they are hidden)
  const visibleSlots = slots.filter((s) => s.type !== "task-cont" && !s.breakContinuation);

  const nowTotal = toMin(nowH, nowM);

  return (
    <div className="space-y-0.5">
      {visibleSlots.map((slot, vi) => {
        const realIdx = slots.indexOf(slot);
        const isPast = isPastDay || (isToday && slot.minOffset + STEP <= nowTotal);
        const isCurrent = isToday && slot.minOffset <= nowTotal && nowTotal < slot.minOffset + STEP * (slot.spanSlots || 1);
        const isEditing = editingTaskId === slot.task?.id;
        const dragging = dragIdx === realIdx;
        const dragOver = dragOverIdx === realIdx && dragIdx !== realIdx;

        // Calculate visual height based on span
        const span = slot.spanSlots || 1;
        const heightClass = span >= 4 ? "min-h-[4rem]" : span >= 2 ? "min-h-[2.5rem]" : "min-h-[1.75rem]";

        return (
          <div
            key={realIdx}
            draggable={isDraggable(slot) && !isEditing}
            onDragStart={(e) => handleDragStart(e, realIdx)}
            onDragOver={(e) => handleDragOver(e, realIdx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, realIdx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 group transition-all ${heightClass} ${isPast ? "opacity-40" : ""} ${dragging ? "opacity-50 scale-[0.97]" : ""} ${dragOver ? "ring-2 ring-accent/40 rounded-lg" : ""}`}
          >
            {/* Drag handle */}
            {isDraggable(slot) && !isPast && (
              <span className="w-4 flex-shrink-0 opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing transition-opacity">
                <GripVertical className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              </span>
            )}
            {!isDraggable(slot) && <span className="w-4 flex-shrink-0" />}

            {/* Time column */}
            <span className={`w-12 text-[11px] font-mono flex-shrink-0 ${isCurrent ? "text-accent font-bold" : "text-muted-light dark:text-muted-dark"}`}>
              {slot.time}
              {isCurrent && <span className="ml-0.5 text-accent">◀</span>}
            </span>

            {/* Slot content */}
            <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
              slot.type === "event"
                ? "bg-accent/10 text-accent font-medium"
                : slot.type === "task"
                ? slot.overdue
                  ? "bg-danger/10 text-danger"
                  : "bg-gray-100 dark:bg-white/5"
                : slot.type === "break"
                ? "bg-warn/10 text-amber-700 dark:text-warn"
                : "bg-gray-50 dark:bg-white/[0.02] text-muted-light dark:text-muted-dark"
            }`}>
              {slot.type === "event" && <Calendar className="w-3 h-3 flex-shrink-0" />}
              {slot.type === "task" && slot.overdue && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
              {slot.type === "task" && slot.scheduled && !slot.overdue && <Clock className="w-3 h-3 flex-shrink-0 text-accent" />}
              {slot.type === "break" && <Coffee className="w-3 h-3 flex-shrink-0" />}
              {slot.type === "free" && <Clock className="w-3 h-3 flex-shrink-0 opacity-30" />}

              {isEditing ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleEditSave(slot.task.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave(slot.task.id);
                    if (e.key === "Escape") setEditingTaskId(null);
                  }}
                  className="flex-1 bg-transparent outline-none border-b border-accent min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="flex-1 truncate">
                  {slot.label || t(`home.${slot.type === "free" ? "freeSlot" : "taskSlot"}`)}
                  {slot.type === "task" && slot.durationMin && (
                    <span className="ml-1.5 text-[10px] font-mono opacity-60">~{slot.durationMin}{t("common.min")}</span>
                  )}
                </span>
              )}

              {slot.type === "task" && slot.priority && !isEditing && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  slot.priority === "high" ? "bg-danger" : slot.priority === "medium" ? "bg-warn" : "bg-success"
                }`} />
              )}
            </div>

            {/* Task action buttons */}
            {slot.type === "task" && slot.task && !isPast && !isEditing && (
              <>
                <button
                  onClick={() => onCompleteTask(slot.task.id)}
                  className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-colors flex items-center justify-center"
                  title={t("tasks.complete")}
                  aria-label={t("tasks.complete")}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                </button>
                <button
                  onClick={() => { setEditingTaskId(slot.task.id); setEditText(slot.task.text); }}
                  className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  title={t("common.edit")}
                  aria-label={t("common.edit")}
                >
                  <Pencil className="w-3 h-3 text-muted-light dark:text-muted-dark" />
                </button>
              </>
            )}
            {slot.type === "task" && slot.task && !isPast && isEditing && (
              <button
                onClick={() => setEditingTaskId(null)}
                className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 flex-shrink-0 flex items-center justify-center transition-all"
                title={t("common.cancel")}
                aria-label={t("common.cancel")}
              >
                <X className="w-3 h-3 text-muted-light dark:text-muted-dark" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const CATEGORY_CONFIG = {
  work:     { emoji: "💼" },
  personal: { emoji: "👤" },
  health:   { emoji: "💪" },
  finance:  { emoji: "💰" },
  learning: { emoji: "📚" },
  home:     { emoji: "🏠" },
  errand:   { emoji: "🏃" },
  creative: { emoji: "🎨" },
};

const MAX_TIMELINE_TASKS = 8;

export default function HomePage() {
  const { t } = useI18n();
  const { state, dispatch } = useApp();
  const { getEventsForDate } = useCalendar();
  const { settings } = useSettings();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [viewDate, setViewDate] = useState(todayStr);
  const isToday = viewDate === todayStr;
  const isPast = viewDate < todayStr;

  const viewEvents = getEventsForDate(viewDate);
  const allDayEvents = viewEvents.filter((ev) => ev.allDay);

  const isTaskOverdue = (task) => task.deadline && !task.completed && new Date(task.deadline + "T23:59:59") < new Date();

  const pendingTasks = state.tasks.filter((tk) => !tk.completed);
  const overdueTasks = pendingTasks.filter(isTaskOverdue);

  // Filter tasks for the day view: exclude tasks whose scheduledDate is in the future
  const dayTasks = isPast
    ? []
    : pendingTasks.filter((tk) => {
        // If task has a scheduledDate and the view date is before that date, hide it
        if (tk.scheduledDate && viewDate < tk.scheduledDate) return false;
        return true;
      });

  const topTasks = [...dayTasks]
        .sort((a, b) => {
          const aOverdue = isTaskOverdue(a) ? 0 : 1;
          const bOverdue = isTaskOverdue(b) ? 0 : 1;
          if (aOverdue !== bOverdue) return aOverdue - bOverdue;
          const p = { high: 0, medium: 1, low: 2 };
          return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
        })
        .slice(0, MAX_TIMELINE_TASKS);

  const handleQuickAdd = (text) => {
    dispatch({ type: "ADD_TASK", payload: { text, priority: "medium", estimatedMinutes: 25 } });
  };

  const shiftDate = (dateStr, delta) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
  };

  const prevDay = () => setViewDate((cur) => shiftDate(cur, -1));
  const nextDay = () => setViewDate((cur) => shiftDate(cur, +1));

  const formatViewDate = () => {
    if (isToday) return t("common.today");
    if (viewDate === shiftDate(todayStr, +1)) return t("common.tomorrow");
    if (viewDate === shiftDate(todayStr, -1)) return t("common.yesterday");
    const [y, m, d] = viewDate.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const features = settings.features || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting + Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t("home.greeting")}</h2>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-0.5">{t("home.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 text-center">
            <p className="text-lg font-bold font-mono text-success">{state.completedToday}</p>
            <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wider">{t("stats.completed")}</p>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <p className="text-lg font-bold font-mono">{pendingTasks.length}</p>
            <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wider">{t("stats.open")}</p>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <p className="text-lg font-bold font-mono text-accent">{state.focusMinutesToday}<span className="text-xs ml-0.5">{t("stats.min")}</span></p>
            <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wider">{t("stats.focusMin")}</p>
          </div>
        </div>
      </div>

      {/* All-day events banner */}
      {allDayEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allDayEvents.map((ev) => (
            <span key={ev.id} className="badge bg-accent/10 text-accent text-xs flex items-center gap-1.5 px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5" /> {ev.title || ev.summary} <span className="opacity-60 text-[10px]">{t("calendar.allDay")}</span>
            </span>
          ))}
        </div>
      )}

      {/* Clock widget (only when time tracking is enabled) */}
      {features.timeTrackingEnabled !== false && <ClockWidget t={t} />}

      {/* Unified Day Timeline */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider">{t("home.dayPlan")}</h3>
            <p className="text-[10px] text-muted-light dark:text-muted-dark mt-0.5">{t("home.dayPlanHint")}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevDay}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
              title={t("home.previousDay")}
              aria-label={t("home.previousDay")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[72px] text-center">{formatViewDate()}</span>
            <button
              onClick={nextDay}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
              title={t("home.nextDay")}
              aria-label={t("home.nextDay")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {overdueTasks.length > 0 && isToday && (
              <span className="badge bg-danger/10 text-danger text-[10px] flex items-center gap-1 ml-1">
                <AlertCircle className="w-3 h-3" /> {overdueTasks.length} {t("tasks.overdue")}
              </span>
            )}
          </div>
        </div>

        {isToday && (
          <div className="mb-3">
            <QuickAddTask t={t} onAdd={handleQuickAdd} />
          </div>
        )}

        <UnifiedDayTimeline
          t={t}
          events={viewEvents}
          tasks={topTasks}
          settings={settings}
          onCompleteTask={(id) => dispatch({ type: "COMPLETE_TASK", payload: id })}
          isTaskOverdue={isTaskOverdue}
          onEditTask={(id, text) => dispatch({ type: "UPDATE_TASK", payload: { id, text } })}
          onUpdateScheduledTime={(id, time) => dispatch({ type: "UPDATE_TASK", payload: { id, scheduledTime: time } })}
          isToday={isToday}
          isPastDay={isPast}
        />
      </div>
    </div>
  );
}
