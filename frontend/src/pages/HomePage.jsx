import { useI18n } from "../i18n/I18nContext";
import { useApp } from "../context/AppContext";
import { useTimeTracking } from "../context/TimeTrackingContext";
import FocusTimer from "../components/FocusTimer";
import StatsPanel from "../components/StatsPanel";
import { CheckCircle, Clock, Calendar, Mail } from "lucide-react";

function QuickCard({ icon: Icon, label, value, accent, unit }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || "bg-accent/10"}`}>
        <Icon className={`w-5 h-5 ${accent ? "text-white" : "text-accent"}`} />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono">{value}{unit && <span className="text-sm ml-0.5">{unit}</span>}</p>
        <p className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  const { state } = useApp();
  const { getTodayMinutes } = useTimeTracking();

  const pendingTasks = state.tasks.filter((t) => !t.completed);
  const topTasks = [...pendingTasks]
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    })
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold">{t("home.greeting")}</h2>
        <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickCard
          icon={CheckCircle}
          label={t("stats.completed")}
          value={state.completedToday}
          accent="bg-success"
        />
        <QuickCard
          icon={CheckCircle}
          label={t("stats.open")}
          value={pendingTasks.length}
        />
        <QuickCard
          icon={Clock}
          label={t("stats.focusMin")}
          value={state.focusMinutesToday}
          unit={t("stats.min")}
          accent="bg-accent"
        />
        <QuickCard
          icon={Clock}
          label={t("timeTracking.workHours")}
          value={getTodayMinutes()}
          unit={t("stats.min")}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Open Tasks */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-3">
              {t("home.openTasks")}
            </h3>
            {topTasks.length === 0 ? (
              <p className="text-sm text-muted-light dark:text-muted-dark py-4 text-center">
                {t("home.noTasks")}
              </p>
            ) : (
              <div className="space-y-2">
                {topTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        task.priority === "high"
                          ? "bg-danger"
                          : task.priority === "medium"
                          ? "bg-warn"
                          : "bg-success"
                      }`}
                    />
                    <span className="text-sm flex-1 truncate">{task.text}</span>
                    <span className="text-[10px] text-muted-light dark:text-muted-dark font-mono">
                      ~{task.estimatedMinutes}{t("common.min")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Focus Timer */}
        <div className="lg:col-span-2">
          <FocusTimer />
        </div>
      </div>
    </div>
  );
}
