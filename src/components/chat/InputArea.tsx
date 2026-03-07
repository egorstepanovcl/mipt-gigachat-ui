import { useRef, useState, KeyboardEvent } from "react";
import styles from "./InputArea.module.css";
import { IconSend, IconStop, IconPaperclip } from "../ui/Icon";

interface InputAreaProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export const InputArea = ({ onSubmit, disabled = false }: InputAreaProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight);
    const maxHeight = lineHeight * 5;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
  };

  const handleInput = () => {
    adjustHeight();
    setValue(textareaRef.current?.value ?? "");
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = value.trim().length === 0;

  return (
    <div className={styles.wrapper}>
      <button className={styles.attach} type="button" title="Прикрепить изображение">
        <IconPaperclip size={18} />
      </button>

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение..."
        rows={1}
        disabled={disabled}
      />

      <button
        className={styles.stop}
        type="button"
        disabled
        title="Стоп"
      >
        <IconStop size={18} />
      </button>

      <button
        className={styles.send}
        type="button"
        onClick={handleSubmit}
        disabled={isEmpty || disabled}
        title="Отправить"
      >
        <IconSend size={18} />
      </button>
    </div>
  );
};
