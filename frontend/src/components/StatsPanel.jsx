import { useApp } from "../context/AppContext";

function StatCard({ label, value, unit, accent }) {
  return (
    <div className="glass-card p-4 text-center">
      <p className={`text-2xl font-bold font-mono ${accent || ""}`}>{value}</p>
      <p className="text-[10px] text-muted-light dark:text-muted-dark mt-1 uppercase tracking-wider">
        {label}
        {unit && <span className="ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

export default function StatsPanel() {
  const { state } = useApp();

  const pendingTasks = state.tasks.filter((t) => !t.completed).length;
  const totalMinutes = state.tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <div className="animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-3">
        Heute
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Erledigt"
          value={state.completedToday}
          accent="text-success"
        />
        <StatCard
          label="Offen"
          value={pendingTasks}
        />
        <StatCard
          label="Fokus"
          value={state.focusMinutesToday}
          unit="min"
          accent="text-accent"
        />
        <StatCard
          label="Geschätzt"
          value={totalMinutes}
          unit="min"
        />
      </div>
    </div>
  );
}
