import { createContext, useContext, useState, type ReactNode } from "react";
import type { Settings } from "../../types";

const DEFAULT_SETTINGS: Settings = {
  model: "GigaChat",
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  systemPrompt: "",
};

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (next: Settings) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const updateSettings = (next: Settings) => setSettings(next);
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
