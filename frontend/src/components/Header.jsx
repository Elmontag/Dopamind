import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import XpBar from "./XpBar";

export default function Header() {
  const { dark, toggle } = useTheme();
  const { state } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Dopamind</h1>
        </div>

        <div className="flex-1 max-w-xs hidden sm:block">
          <XpBar />
        </div>

        <div className="flex items-center gap-2">
          <div className="badge bg-accent/10 text-accent dark:bg-accent/20">
            Lv. {state.level}
          </div>

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Theme wechseln"
          >
            {dark ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-2">
        <XpBar />
      </div>
    </header>
  );
}
