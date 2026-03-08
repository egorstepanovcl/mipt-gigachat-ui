import { useRef, useState, useEffect, KeyboardEvent, DragEvent } from "react";
import { IconSend, IconStop, IconPaperclip } from "../ui/Icon";
import styles from "./ChatInput.module.css";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxRows?: number;
  maxLength?: number;
  onTyping?: () => void;
  onFilesDrop?: (files: FileList) => void;
};

export const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Напишите сообщение...",
  maxRows = 8,
  maxLength = 4000,
  onTyping,
  onFilesDrop,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      onFilesDrop?.(e.dataTransfer.files);
    }
  };

  const isEmpty = value.trim().length === 0;
  const charsLeft = maxLength ? maxLength - value.length : null;
  const showCounter = maxLength && value.length > maxLength * 0.8;

  return (
    <div
      className={`${styles.outer} ${isDragging ? styles.dragging : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.wrapper}>
        <button
          className={styles.attach}
          type="button"
          title="Прикрепить файл"
          tabIndex={-1}
        >
          <IconPaperclip size={18} />
        </button>

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
          disabled
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
