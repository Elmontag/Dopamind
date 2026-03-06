import { useState } from "react";
import { AlertTriangle, Monitor, Smartphone, Calendar, CheckSquare, Tag, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { resolveConflict } from "../services/syncEngine";

/**
 * Conflict Resolution Dialog
 *
 * Shows when bilateral changes are detected after reconnecting.
 * User picks "local" (PWA/offline version) or "server" (web version) for each conflict.
 */
export default function ConflictDialog({ conflicts, onResolved }) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolving, setResolving] = useState(false);
  const [resolutions, setResolutions] = useState([]);

  if (!conflicts || conflicts.length === 0) return null;

  const conflict = conflicts[currentIndex];
  const isLast = currentIndex === conflicts.length - 1;

  const handleResolve = async (choice) => {
    setResolving(true);
    try {
      const result = await resolveConflict(conflict, choice);
      const newResolutions = [...resolutions, { conflict, choice, result }];
      setResolutions(newResolutions);

      if (isLast) {
        onResolved(newResolutions);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } catch {
      // On error, skip and move on
      const newResolutions = [...resolutions, { conflict, choice, result: conflict.server }];
      setResolutions(newResolutions);
      if (isLast) {
        onResolved(newResolutions);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    } finally {
      setResolving(false);
    }
  };

  const entityIcon = conflict.entityType === "task" ? CheckSquare
    : conflict.entityType === "category" ? Tag
    : Calendar;
  const EntityIcon = entityIcon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-gray-200 dark:border-white/10">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold">
              {t("sync.conflictTitle")}
            </h2>
            <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
              {t("sync.conflictSubtitle", { current: currentIndex + 1, total: conflicts.length })}
            </p>
          </div>
        </div>

        {/* Entity Info */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark mb-3">
            <EntityIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{conflict.entityType}</span>
            {conflict.entityType === "task" && (
              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                {conflict.local?.text || conflict.server?.text || ""}
              </span>
            )}
            {conflict.entityType === "category" && (
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {conflict.local?.name || conflict.server?.name || ""}
              </span>
            )}
            {conflict.entityType === "calendar" && (
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {conflict.local?.summary || conflict.local?.title || ""}
              </span>
            )}
          </div>

          {/* Side-by-side comparison */}
          <div className="grid grid-cols-2 gap-3">
            {/* Local version */}
            <button
              onClick={() => handleResolve("local")}
              disabled={resolving}
              className="text-left p-3 rounded-xl border-2 border-transparent hover:border-accent bg-blue-50 dark:bg-blue-950/30 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {t("sync.localVersion")}
                </span>
              </div>
              <ConflictDetails entity={conflict.local} type={conflict.entityType} t={t} />
              <div className="mt-2 text-[10px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                {t("sync.keepThis")}
              </div>
            </button>

            {/* Server version */}
            <button
              onClick={() => handleResolve("server")}
              disabled={resolving}
              className="text-left p-3 rounded-xl border-2 border-transparent hover:border-accent bg-green-50 dark:bg-green-950/30 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Monitor className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  {t("sync.serverVersion")}
                </span>
              </div>
              {conflict.server ? (
                <ConflictDetails entity={conflict.server} type={conflict.entityType} t={t} />
              ) : (
                <p className="text-xs text-muted-light dark:text-muted-dark italic">
                  {t("sync.alreadyExists")}
                </p>
              )}
              <div className="mt-2 text-[10px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                {t("sync.keepThis")}
              </div>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / conflicts.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConflictDetails({ entity, type, t }) {
  if (!entity) return <p className="text-xs text-muted-light dark:text-muted-dark">-</p>;

  if (type === "task") {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium truncate">{entity.text}</p>
        <div className="flex flex-wrap gap-1">
          {entity.priority && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              entity.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
              entity.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
              "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
            }`}>
              {entity.priority}
            </span>
          )}
          {entity.completed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {t("common.done") || "done"}
            </span>
          )}
          {entity.deadline && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
              {entity.deadline}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (type === "category") {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium">{entity.name}</p>
        {entity.color && (
          <span className={`inline-block w-3 h-3 rounded-full bg-${entity.color}-500`} />
        )}
      </div>
    );
  }

  if (type === "calendar") {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium">{entity.summary || entity.title}</p>
        <p className="text-[10px] text-muted-light dark:text-muted-dark">
          {entity.date || (entity.start && entity.start.slice(0, 10))}
        </p>
      </div>
    );
  }

  return null;
}
