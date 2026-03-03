import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useApp } from "../context/AppContext";
import { useCalendar } from "../context/CalendarContext";
import { useTimeTracking } from "../context/TimeTrackingContext";
import { useSettings } from "../context/SettingsContext";
import {
  CheckCircle, Calendar, Plus,
  LogIn, LogOut, Coffee, AlertCircle, Clock,
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

function UnifiedDayTimeline({ t, events, tasks, settings, onCompleteTask, isTaskOverdue }) {
  const startH = parseInt(settings.workSchedule.start.split(":")[0], 10);
  const endH = parseInt(settings.workSchedule.end.split(":")[0], 10);
  const breakMin = settings.workSchedule.breakMinutes;
  const now = new Date();
  const nowH = now.getHours();
  const nowMin = now.getMinutes();

  // Build hourly slots
  const slots = [];
  for (let h = startH; h < endH; h++) {
    const timeStr = `${String(h).padStart(2, "0")}:00`;
    const event = events.find((ev) => {
      if (ev.allDay) return false;
      const evStart = ev.start ? new Date(ev.start) : null;
      const evEnd = ev.end ? new Date(ev.end) : null;
      if (!evStart) return false;
      const evStartH = evStart.getHours();
      const evEndH = evEnd ? evEnd.getHours() : evStartH + 1;
      return h >= evStartH && h < evEndH;
    });
    if (event) {
      slots.push({ time: timeStr, hour: h, type: "event", label: event.title || event.summary });
    } else {
      slots.push({ time: timeStr, hour: h, type: "free" });
    }
  }

  // Fill free slots with pending tasks
  const pendingTasks = [...tasks];
  for (const slot of slots) {
    if (slot.type === "free" && pendingTasks.length > 0) {
      const task = pendingTasks.shift();
      slot.type = "task";
      slot.task = task;
      slot.label = task.text;
      slot.priority = task.priority;
      slot.overdue = isTaskOverdue(task);
    }
  }

  // Insert break in the middle
  if (breakMin > 0 && slots.length > 2) {
    const midIdx = Math.floor(slots.length / 2);
    slots.splice(midIdx, 0, {
      time: slots[midIdx]?.time,
      hour: slots[midIdx]?.hour,
      type: "break",
      label: `${breakMin}${t("common.min")} ${t("timeTracking.break")}`,
    });
  }

  return (
    <div className="space-y-1">
      {slots.map((slot, i) => {
        const isPast = slot.hour !== undefined && slot.hour < nowH;
        const isCurrent = slot.hour !== undefined && slot.hour === nowH;

        return (
          <div
            key={i}
            className={`flex items-center gap-3 group transition-opacity ${isPast ? "opacity-40" : ""}`}
          >
            {/* Time column */}
            <span className={`w-12 text-[11px] font-mono flex-shrink-0 ${isCurrent ? "text-accent font-bold" : "text-muted-light dark:text-muted-dark"}`}>
              {slot.time}
              {isCurrent && <span className="ml-0.5 text-accent">◀</span>}
            </span>

            {/* Slot content */}
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
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
              {slot.type === "break" && <Coffee className="w-3 h-3 flex-shrink-0" />}
              {slot.type === "free" && <Clock className="w-3 h-3 flex-shrink-0 opacity-30" />}

              <span className="flex-1 truncate">
                {slot.label || t(`home.${slot.type === "free" ? "freeSlot" : "taskSlot"}`)}
              </span>

              {slot.type === "task" && slot.priority && (
                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  slot.priority === "high" ? "bg-danger" : slot.priority === "medium" ? "bg-warn" : "bg-success"
                }`} />
              )}
            </div>

            {/* Inline task complete button */}
            {slot.type === "task" && slot.task && !isPast && (
              <button
                onClick={() => onCompleteTask(slot.task.id)}
                className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                title={t("tasks.complete")}
              >
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const MAX_TIMELINE_TASKS = 8;

export default function HomePage() {
  const { t } = useI18n();
  const { state, dispatch } = useApp();
  const { getEventsForDate } = useCalendar();
  const { settings } = useSettings();

  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = getEventsForDate(today);

  const allDayEvents = todayEvents.filter((ev) => ev.allDay);

  const isTaskOverdue = (task) => task.deadline && !task.completed && new Date(task.deadline + "T23:59:59") < new Date();

  const pendingTasks = state.tasks.filter((tk) => !tk.completed);
  const overdueTasks = pendingTasks.filter(isTaskOverdue);
  const topTasks = [...pendingTasks]
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

      {/* Clock widget */}
      <ClockWidget t={t} />

      {/* Unified Day Timeline */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider">{t("home.dayPlan")}</h3>
            <p className="text-[10px] text-muted-light dark:text-muted-dark mt-0.5">{t("home.dayPlanHint")}</p>
          </div>
          {overdueTasks.length > 0 && (
            <span className="badge bg-danger/10 text-danger text-[10px] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {overdueTasks.length} {t("tasks.overdue")}
            </span>
          )}
        </div>

        <div className="mb-3">
          <QuickAddTask t={t} onAdd={handleQuickAdd} />
        </div>

        <UnifiedDayTimeline
          t={t}
          events={todayEvents}
          tasks={topTasks}
          settings={settings}
          onCompleteTask={(id) => dispatch({ type: "COMPLETE_TASK", payload: id })}
          isTaskOverdue={isTaskOverdue}
        />
      </div>
    </div>
  );
}
