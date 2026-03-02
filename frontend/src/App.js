import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import TaskManager from "./components/TaskManager";
import FocusTimer from "./components/FocusTimer";
import StatsPanel from "./components/StatsPanel";
import RewardToast from "./components/RewardToast";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
            {/* Motivational greeting */}
            <div className="mb-6 animate-slide-up">
              <h2 className="text-xl font-semibold">
                Ein Schritt nach dem anderen.
              </h2>
              <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
                Wähle eine Aufgabe, starte einen Fokus-Block, sammle XP.
              </p>
            </div>

            {/* Main layout: Tasks left, Timer + Stats right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <TaskManager />
              </div>
              <div className="lg:col-span-2 space-y-5">
                <FocusTimer />
                <StatsPanel />
              </div>
            </div>
          </main>

          <footer className="text-center py-4 text-[10px] text-muted-light dark:text-muted-dark">
            Dopamind &middot; Für die ADHS-Community
          </footer>

          <RewardToast />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
