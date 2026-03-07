import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getJson, setJson } from '../storage/storage';

const STORAGE_KEY = 'dopamind-settings';

export interface Settings {
  imap: { host: string; port: number; user: string; password: string; tls: boolean };
  smtp: { host: string; port: number; user: string; password: string; tls: boolean };
  caldav: { url: string; user: string; password: string; calendarUrl: string };
  assistanceWindow: { start: string; end: string; activeDays: number[] };
  workSchedule?: { start: string; end: string; workDays: number[] };
  gamification: {
    xpEnabled: boolean;
    soundEnabled: boolean;
    compassionModeEnabled: boolean;
    microConfettiEnabled: boolean;
    variableRewardsEnabled: boolean;
    flowShieldEnabled: boolean;
    countdownStartEnabled: boolean;
    energyCheckinEnabled: boolean;
    dailyChallengeEnabled: boolean;
    pauseSuggestionsEnabled: boolean;
    weeklyReportEnabled: boolean;
  };
  notifications: { enabled: boolean; focusReminder: boolean };
  mail: { masterTagEnabled: boolean; masterTag: string };
  features: {
    mailEnabled: boolean;
    calendarEnabled: boolean;
    resourceMonitorEnabled: boolean;
    gamificationEnabled: boolean;
    timeTrackingEnabled?: boolean;
  };
  timeWarnings: {
    enabled: boolean;
    moderateThreshold1: number;
    moderateThreshold2: number;
    criticalThreshold1: number;
    criticalThreshold2: number;
  };
  timeline: {
    gridInterval: number;
    hideParentWithSubtasks: boolean;
    taskSchedulingRound: string;
    taskSchedulingCustomMinutes: number;
    timeRangeMode: string;
    customTimeStart: string;
    customTimeEnd: string;
  };
  estimation: {
    sizeMappings: { quick: number; short: number; medium: number; long: number };
    autopilot: boolean;
  };
  timezone: string;
}

const defaultSettings: Settings = {
  imap: { host: '', port: 993, user: '', password: '', tls: true },
  smtp: { host: '', port: 587, user: '', password: '', tls: true },
  caldav: { url: '', user: '', password: '', calendarUrl: '' },
  assistanceWindow: { start: '08:00', end: '17:00', activeDays: [1, 2, 3, 4, 5] },
  gamification: {
    xpEnabled: true,
    soundEnabled: false,
    compassionModeEnabled: true,
    microConfettiEnabled: true,
    variableRewardsEnabled: true,
    flowShieldEnabled: true,
    countdownStartEnabled: true,
    energyCheckinEnabled: true,
    dailyChallengeEnabled: true,
    pauseSuggestionsEnabled: true,
    weeklyReportEnabled: true,
  },
  notifications: { enabled: true, focusReminder: true },
  mail: { masterTagEnabled: false, masterTag: 'dopamind' },
  features: {
    mailEnabled: false,
    calendarEnabled: true,
    resourceMonitorEnabled: true,
    gamificationEnabled: true,
  },
  timeWarnings: {
    enabled: true,
    moderateThreshold1: 60,
    moderateThreshold2: 30,
    criticalThreshold1: 15,
    criticalThreshold2: 0,
  },
  timeline: {
    gridInterval: 30,
    hideParentWithSubtasks: false,
    taskSchedulingRound: 'halfHour',
    taskSchedulingCustomMinutes: 30,
    timeRangeMode: 'workHours',
    customTimeStart: '06:00',
    customTimeEnd: '22:00',
  },
  estimation: {
    sizeMappings: { quick: 10, short: 25, medium: 45, long: 90 },
    autopilot: false,
  },
  timezone: 'auto',
};

function migrateSettings(s: Settings): Settings {
  if ((s as Record<string, unknown>).workSchedule && !s.assistanceWindow) {
    const ws = (s as Record<string, unknown>).workSchedule as Record<string, unknown>;
    s.assistanceWindow = {
      start: (ws.start as string) || defaultSettings.assistanceWindow.start,
      end: (ws.end as string) || defaultSettings.assistanceWindow.end,
      activeDays: (ws.workDays as number[]) || defaultSettings.assistanceWindow.activeDays,
    };
  }
  if ((s as Record<string, unknown>).breakPattern) {
    delete (s as Record<string, unknown>).breakPattern;
  }
  if (s.features && s.features.timeTrackingEnabled !== undefined && s.features.resourceMonitorEnabled === undefined) {
    s.features.resourceMonitorEnabled = s.features.timeTrackingEnabled;
  }
  if (s.assistanceWindow && !s.workSchedule) {
    s.workSchedule = {
      start: s.assistanceWindow.start,
      end: s.assistanceWindow.end,
      workDays: s.assistanceWindow.activeDays,
    };
  } else if (s.assistanceWindow && s.workSchedule) {
    s.workSchedule.start = s.assistanceWindow.start;
    s.workSchedule.end = s.assistanceWindow.end;
    s.workSchedule.workDays = s.assistanceWindow.activeDays;
  }
  if (s.features) {
    s.features.timeTrackingEnabled = s.features.resourceMonitorEnabled;
  }
  return s;
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key];
    const tv = target[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
      (result as Record<keyof T, unknown>)[key] = deepMerge(tv as object, sv as object);
    } else if (sv !== undefined) {
      (result as Record<keyof T, unknown>)[key] = sv;
    }
  }
  return result;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (section: keyof Settings, values: unknown) => void;
  isMailConfigured: boolean;
  isCalendarConfigured: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(migrateSettings({ ...defaultSettings }));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getJson<Settings | null>(STORAGE_KEY, null).then((saved) => {
      if (saved && typeof saved === 'object') {
        setSettings(migrateSettings(deepMerge(defaultSettings, saved)));
      }
    });
  }, []);

  const updateSettings = useCallback((section: keyof Settings, values: unknown) => {
    setSettings((prev) => {
      const prevSection = prev[section];
      const next: Settings =
        values && typeof values === 'object' && !Array.isArray(values) && prevSection && typeof prevSection === 'object'
          ? { ...prev, [section]: { ...(prevSection as object), ...(values as object) } }
          : { ...prev, [section]: values };
      const migrated = migrateSettings(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setJson(STORAGE_KEY, migrated).catch(() => {});
      }, 300);
      return migrated;
    });
  }, []);

  const isMailConfigured = Boolean(settings.imap.host && settings.imap.user);
  const isCalendarConfigured = Boolean(settings.caldav.url && settings.caldav.user);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isMailConfigured, isCalendarConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
