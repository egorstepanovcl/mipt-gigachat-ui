import { useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { IconSend, IconStop } from "../ui/Icon";
import styles from "./ChatInput.module.css";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxRows?: number;
  maxLength?: number;
  onTyping?: () => void;
};

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onStop,
  disabled = false,
  placeholder = "Напишите сообщение...",
  maxRows = 8,
  maxLength = 4000,
  onTyping,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Динамически подстраиваем высоту textarea под содержимое
  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24;
    const maxHeight = lineHeight * maxRows;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (maxLength && e.target.value.length > maxLength) return;
    onChange(e.target.value);
    onTyping?.();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    onChange("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter — отправить, Shift+Enter — перенос строки
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    // Ctrl/Cmd+K — очистить поле
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onChange("");
      return;
    }
    if (e.key === "Escape") {
      onChange("");
      textareaRef.current?.blur();
    }
  };

  const isEmpty = value.trim().length === 0;
  const charsLeft = maxLength ? maxLength - value.length : null;
  // Показываем счётчик только когда использовано >80% лимита
  const showCounter = maxLength && value.length > maxLength * 0.8;

  return (
    <div className={styles.outer}>
      <div className={styles.wrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
        />

        {showCounter && (
          <span
            className={`${styles.counter} ${charsLeft! < 100 ? styles.counterWarn : ""}`}
          >
            {charsLeft}
          </span>
        )}

        <button
          className={styles.stop}
          type="button"
          onClick={onStop}
          disabled={!disabled}
          title="Стоп"
          tabIndex={-1}
        >
          <IconStop size={18} />
        </button>

        <button
          className={styles.send}
          type="button"
          onClick={handleSend}
          disabled={isEmpty || disabled}
          title="Отправить"
        >
          <IconSend size={18} />
        </button>
      </div>
    </div>
  );
};