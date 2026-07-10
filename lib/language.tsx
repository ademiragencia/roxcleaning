"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import en from "@/dictionaries/en.json";
import pt from "@/dictionaries/pt.json";

export type Lang = "en" | "pt";
export type Dict = typeof en;

const dictionaries: Record<Lang, Dict> = { en, pt };

const STORAGE_KEY = "rox-lang";

// Tiny external store backed by localStorage. EN is the default and what gets
// statically pre-rendered; the stored preference kicks in right after hydration.
const listeners = new Set<() => void>();

const langStore = {
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot(): Lang {
    return window.localStorage.getItem(STORAGE_KEY) === "pt" ? "pt" : "en";
  },
  getServerSnapshot(): Lang {
    return "en";
  },
  set(lang: Lang) {
    window.localStorage.setItem(STORAGE_KEY, lang);
    listeners.forEach((listener) => listener());
  },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    langStore.subscribe,
    langStore.getSnapshot,
    langStore.getServerSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: langStore.set, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
