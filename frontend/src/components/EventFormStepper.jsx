import { useState, useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Check, ChevronRight, MapPin, X } from "lucide-react";

/**
 * EventFormStepper — shared 3-step stepper for adding/editing calendar events.
 *
 * Props:
 *   formData       { title, description, location, date, start, end, allDay }
 *   setFormData    (updater) => void
 *   onSubmit       (e?) => void   — called with the final formData
 *   onCancel       () => void
 *   editing        boolean        — if true, all steps are pre-filled on open
 */
export default function EventFormStepper({ formData, setFormData, onSubmit, onCancel, editing = false }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const titleRef = useRef(null);

  // Reset step to 0 and focus title input on every fresh mount (not on re-renders)
  useEffect(() => {
    setStep(0);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []); // eslint-disable-line

  const stepLabels = [
    t("calendar.stepTitle"),
    t("calendar.stepWhen"),
    t("calendar.stepPlace"),
  ];

  const STEPS = [0, 1, 2];

  const btnClass = (active) =>
    `px-3 py-2 rounded-xl text-xs font-medium transition-all ${active ? "ring-2 ring-accent shadow-sm" : "hover:opacity-80"}`;

  const getSummaryValue = (i) => {
    if (i === 0) return formData.title.trim() || "—";
    if (i === 1) {
      if (formData.allDay) return `${formData.date} · ${t("calendar.allDay")}`;
      return `${formData.date} ${formData.start}–${formData.end}`;
    }
    if (i === 2) return formData.location || "—";
    return "";
  };

  const handleSubmitForm = (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(e);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-white/5 space-y-1 animate-fade-in">
      {STEPS.map((_, i) => {
        if (i > step) return null;
        const isDone = i < step;
        const isActive = i === step;

        return (
          <div key={i} className="flex gap-2.5">
            {/* Vertical stepper column */}
            <div className="flex flex-col items-center" style={{ width: "18px", flexShrink: 0 }}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                isDone ? "bg-accent" : "ring-2 ring-accent bg-white dark:bg-gray-800"
              }`}>
                {isDone
                  ? <Check className="w-2.5 h-2.5 text-white" />
                  : <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                }
              </div>
              {i < step && (
                <div className="w-px bg-accent/25 flex-1 mt-1" style={{ minHeight: "10px" }} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="text-[9px] text-muted-light dark:text-muted-dark uppercase tracking-wider font-semibold mb-1">
                {stepLabels[i]}
              </div>

              {/* Completed step: compact clickable summary */}
              {isDone && (
                <button
                  onClick={() => setStep(i)}
                  className="flex items-center gap-1.5 hover:opacity-75 transition-opacity text-left"
                >
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                    {getSummaryValue(i)}
                  </span>
                </button>
              )}

              {/* Active step */}
              {isActive && (
                <div className="mt-1 animate-fade-in space-y-2">

                  {/* Step 0: Title */}
                  {i === 0 && (
                    <>
                      <input
                        ref={titleRef}
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                        placeholder={t("calendar.eventTitle")}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && formData.title.trim()) { e.preventDefault(); setStep(1); }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { if (formData.title.trim()) setStep(1); }}
                          disabled={!formData.title.trim()}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            !formData.title.trim()
                              ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                              : "btn-primary"
                          }`}
                        >
                          {t("quickBubble.next")}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={onCancel} className="btn-ghost text-xs px-3">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 1: Date & Time */}
                  {i === 1 && (
                    <>
                      <div className="flex flex-col gap-2">
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                        <label className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.allDay}
                            onChange={(e) => setFormData((f) => ({ ...f, allDay: e.target.checked }))}
                            className="rounded"
                          />
                          {t("calendar.allDay")}
                        </label>
                        {!formData.allDay && (
                          <div className="flex gap-2">
                            <input
                              type="time"
                              value={formData.start}
                              onChange={(e) => setFormData((f) => ({ ...f, start: e.target.value }))}
                              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                            <input
                              type="time"
                              value={formData.end}
                              onChange={(e) => setFormData((f) => ({ ...f, end: e.target.value }))}
                              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (formData.date) setStep(2); }}
                        disabled={!formData.date}
                        className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          !formData.date
                            ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                            : "btn-primary"
                        }`}
                      >
                        {t("quickBubble.next")}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Step 2: Location + Save */}
                  {i === 2 && (
                    <form onSubmit={handleSubmitForm} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark flex-shrink-0" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                          placeholder={t("calendar.eventLocation")}
                          className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={!formData.title.trim()}
                          className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t("calendar.save")}
                        </button>
                        <button type="button" onClick={onCancel} className="btn-ghost text-xs">
                          {t("calendar.cancel")}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
