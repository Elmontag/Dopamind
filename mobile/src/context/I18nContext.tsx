import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '../storage/storage';
import de from '../i18n/de.json';
import en from '../i18n/en.json';

type Locale = typeof de;
type Locales = { de: Locale; en: Locale };

const locales: Locales = { de, en };
const STORAGE_KEY = 'dopamind-lang';

interface I18nContextValue {
  lang: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  switchLang: (lang: string) => void;
  availableLanguages: string[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolve(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<string>('de');

  useEffect(() => {
    getItem(STORAGE_KEY).then((saved) => {
      if (saved && (locales as Record<string, unknown>)[saved]) {
        setLang(saved);
      }
    });
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const locale = (locales as Record<string, Record<string, unknown>>)[lang] ?? locales.de;
      let value =
        (resolve(locale as Record<string, unknown>, key) as string | undefined) ??
        (resolve(locales.de as unknown as Record<string, unknown>, key) as string | undefined) ??
        key;
      if (typeof value === 'string' && params) {
        Object.entries(params).forEach(([k, v]) => {
          value = (value as string).replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return typeof value === 'string' ? value : key;
    },
    [lang],
  );

  const switchLang = useCallback((newLang: string) => {
    if ((locales as Record<string, unknown>)[newLang]) {
      setLang(newLang);
      setItem(STORAGE_KEY, newLang).catch(() => {});
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, switchLang, availableLanguages: Object.keys(locales) }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
