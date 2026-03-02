import { useApp } from "../context/AppContext";
import { useEffect } from "react";

const ICONS = {
  "level-up": (
    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  "hat-trick": (
    <svg className="w-6 h-6 text-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

export default function RewardToast() {
  const { state, dispatch } = useApp();

  const activeRewards = state.rewards.slice(-3);

  useEffect(() => {
    if (activeRewards.length === 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: "DISMISS_REWARD", payload: activeRewards[0].id });
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeRewards, dispatch]);

  if (activeRewards.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {activeRewards.map((r) => (
        <div
          key={r.id}
          className="glass-card flex items-center gap-3 px-4 py-3 animate-slide-up shadow-lg min-w-[220px]"
        >
          <div className="animate-reward-pop">
            {ICONS[r.type] || ICONS["level-up"]}
          </div>
          <p className="text-sm font-medium">{r.message}</p>
          <button
            onClick={() => dispatch({ type: "DISMISS_REWARD", payload: r.id })}
            className="ml-auto text-muted-light hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
