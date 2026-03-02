import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { useApp } from "../context/AppContext";
import FocusTimer from "../components/FocusTimer";
import StatsPanel from "../components/StatsPanel";

const PRIORITY_CONFIG = {
  high: { dot: "bg-danger", color: "bg-danger/10 text-danger dark:bg-danger/20" },
  medium: { dot: "bg-warn", color: "bg-warn/10 text-amber-700 dark:bg-warn/20 dark:text-warn" },
  low: { dot: "bg-success", color: "bg-success/10 text-success dark:bg-success/20" },
};

function TaskItem({ task, t }) {
  const { dispatch } = useApp();
  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        task.completed
          ? "opacity-50 scale-[0.98]"
          : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
      }`}
    >
      <button
        onClick={() => !task.completed && dispatch({ type: "COMPLETE_TASK", payload: task.id })}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          task.completed
            ? "border-success bg-success"
            : "border-gray-300 dark:border-gray-600 hover:border-accent"
        }`}
        disabled={task.completed}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-light" : ""}`}>
          {task.text}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`badge text-[10px] ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot} mr-1`} />
            {t(`tasks.priority.${task.priority}`)}
          </span>
          <span className="text-[10px] text-muted-light dark:text-muted-dark font-mono">
            ~{task.estimatedMinutes}{t("common.min")}
          </span>
        </div>
      </div>

      {!task.completed && (
        <button
          onClick={() => dispatch({ type: "DELETE_TASK", payload: task.id })}
          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-light hover:text-danger hover:bg-danger/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { t } = useI18n();
  const { state, dispatch } = useApp();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [minutes, setMinutes] = useState(25);
  const [filter, setFilter] = useState("all");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    dispatch({
      type: "ADD_TASK",
      payload: { text: text.trim(), priority, estimatedMinutes: minutes },
    });
    setText("");
  };

  const filteredTasks = state.tasks.filter((task) => {
    if (filter === "open") return !task.completed;
    if (filter === "done") return task.completed;
    return true;
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Tasks Panel */}
        <div className="lg:col-span-3">
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-4">
              {t("tasks.title")}
            </h2>

            {/* Add form */}
            <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("tasks.addPlaceholder")}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
                <button type="submit" className="btn-primary text-sm whitespace-nowrap">
                  {t("tasks.add")}
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriority(key)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        priority === key
                          ? cfg.color + " ring-1 ring-current/20"
                          : "text-muted-light dark:text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {t(`tasks.priority.${key}`)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center text-xs focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <span className="text-muted-light dark:text-muted-dark">{t("common.min")}</span>
                </div>
              </div>
            </form>

            {/* Filter tabs */}
            <div className="flex gap-1 mb-4">
              {["all", "open", "done"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-accent/10 text-accent dark:bg-accent/20"
                      : "text-muted-light dark:text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  {t(`tasks.filter.${f}`)}
                </button>
              ))}
            </div>

            {/* Task list */}
            <div className="space-y-1">
              {sortedTasks.length === 0 && (
                <div className="text-center py-8 text-muted-light dark:text-muted-dark">
                  <p className="text-sm">{t("tasks.empty")}</p>
                  <p className="text-xs mt-1">{t("tasks.emptyHint")}</p>
                </div>
              )}
              {sortedTasks.map((task) => (
                <TaskItem key={task.id} task={task} t={t} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          <FocusTimer />
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}
