import { useState } from "react";
import type { Chat } from "../../types";
import styles from "./ChatItem.module.css";

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const day = 86400000;

  if (diff < day) return "Сегодня";
  if (diff < day * 2) return "Вчера";
  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
};

const ChatItem = ({ chat, isActive, onSelect, onEdit, onDelete }: ChatItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(chat.id);
  };

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      onClick={() => onSelect(chat.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(chat.id)}
    >
      {/* Иконка чата */}
      <svg className={styles.chatIcon} viewBox="0 0 20 20" fill="none">
        <path
          d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H7l-4 3V5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Текст */}
      <div className={styles.content}>
        <span className={styles.title}>{chat.title}</span>
        <span className={styles.date}>{formatDate(chat.updatedAt)}</span>
      </div>

      {/* Hover-кнопки */}
      {isHovered && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={handleEdit}
            aria-label="Переименовать"
            title="Переименовать"
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            aria-label="Удалить"
            title="Удалить"
          >
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M3 4h10M6 4V2.5h4V4M5 4v8h6V4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
