import { useState, useEffect } from "react";
import { Button, Toggle, Slider } from "../ui";
import { useSettings } from "../../app/providers/SettingsProvider";
import type { Theme, Settings } from "../../types";
import styles from "./SettingsPanel.module.css";

// Доступные модели для выбора
const MODELS = ["GigaChat-Lite", "GigaChat-Pro", "GigaChat-Max"];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}: SettingsPanelProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [draft, setDraft] = useState<Settings>(settings);

  // При открытии панели синхронизируем черновик с текущими настройками
  useEffect(() => {
    if (isOpen) setDraft(settings);
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(draft);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setDraft({
      model: "GigaChat-Lite",
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 1024,
      systemPrompt: "",
    });
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Настройки</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className={styles.body}>

          {/* Модель */}
          <div className={styles.field}>
            <label className={styles.label}>Модель</label>
            <div className={styles.modelGrid}>
              {MODELS.map((model) => (
                <button
                  key={model}
                  className={`${styles.modelBtn} ${draft.model === model ? styles.modelBtnActive : ""}`}
                  onClick={() => update("model", model)}
                  type="button"
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className={styles.field}>
            <label className={styles.label}>
              Temperature
              <span className={styles.value}>{draft.temperature.toFixed(2)}</span>
            </label>
            <Slider
              min={0}
              max={2}
              step={0.01}
              value={draft.temperature}
              onChange={(v) => update("temperature", v)}
            />
          </div>

          {/* Top-P */}
          <div className={styles.field}>
            <label className={styles.label}>
              Top-P
              <span className={styles.value}>{draft.topP.toFixed(2)}</span>
            </label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={draft.topP}
              onChange={(v) => update("topP", v)}
            />
          </div>

          {/* Max Tokens */}
          <div className={styles.field}>
            <label className={styles.label}>Max Tokens</label>
            <input
              className={styles.numberInput}
              type="number"
              min={1}
              max={32768}
              value={draft.maxTokens}
              onChange={(e) => update("maxTokens", Number(e.target.value))}
            />
          </div>

          {/* System Prompt */}
          <div className={styles.field}>
            <label className={styles.label}>System Prompt</label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Вы — полезный ассистент..."
              value={draft.systemPrompt}
              onChange={(e) => update("systemPrompt", e.target.value)}
            />
          </div>

          {/* Тема */}
          <div className={styles.fieldRow}>
            <span className={styles.label}>Тёмная тема</span>
            <Toggle
              checked={theme === "dark"}
              onChange={onToggleTheme}
            />
          </div>

        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={handleReset}>Сбросить</Button>
          <Button variant="primary" onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </>
  );
};
