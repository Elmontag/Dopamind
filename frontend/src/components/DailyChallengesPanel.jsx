import { useApp, checkChallengeProgress } from "../context/AppContext";
import { useI18n } from "../i18n/I18nContext";
import { Target, Gift, Check } from "lucide-react";

export default function DailyChallengesPanel() {
  const { state, dispatch } = useApp();
  const { t } = useI18n();

  const challenges = state.dailyChallenges || [];
  if (challenges.length === 0) return null;

  return (
    <div className="glass-card p-5 animate-fade-in">
      <h2 className="text-sm font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider mb-3 flex items-center gap-2">
        <Target className="w-4 h-4" />
        {t("dailyChallenges.title")}
      </h2>
      <div className="space-y-3">
        {challenges.map((ch) => {
          const progress = checkChallengeProgress(ch, state);
          const pct = Math.min(100, Math.round((progress / ch.target) * 100));
          const isComplete = progress >= ch.target;

          return (
            <div
              key={ch.id}
              className={`rounded-xl p-3 transition-all ${
                ch.claimed
                  ? "bg-success/10 border border-success/20"
                  : isComplete
                  ? "bg-accent/10 border border-accent/30 shadow-sm"
                  : "bg-gray-50 dark:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-sm font-medium flex-1">
                  {t(`dailyChallenges.${ch.id}.name`)}
                </p>
                <span className="text-[10px] font-mono text-accent px-1.5 py-0.5 rounded-md bg-accent/10">
                  +{ch.xp} XP
                </span>
              </div>
              <p className="text-[11px] text-muted-light dark:text-muted-dark mb-2">
                {t(`dailyChallenges.${ch.id}.desc`)}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ch.claimed ? "bg-success" : "bg-accent"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                  {progress}/{ch.target}
                </span>
                {isComplete && !ch.claimed && (
                  <button
                    onClick={() => dispatch({ type: "CLAIM_DAILY_CHALLENGE", payload: ch.id })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                  >
                    <Gift className="w-3 h-3" />
                    {t("dailyChallenges.claim")}
                  </button>
                )}
                {ch.claimed && (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
