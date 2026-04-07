import { useState, memo } from "react";
import { IconChat, IconPencil, IconTrash } from "../ui/Icon";
import type { Chat } from "../../types";
import styles from "./ChatItem.module.css";

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  snippet?: string;
}

// Форматируем дату последнего обновления чата в читаемый вид
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

const ChatItemComponent = ({ chat, isActive, onSelect, onEdit, onDelete, snippet }: ChatItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Останавливаем всплытие, чтобы не активировать выбор чата
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
      <IconChat size={16} />

      <div className={styles.content}>
        <span className={styles.title}>{chat.title}</span>
        {snippet ? (
          <span className={styles.snippet}>{snippet}</span>
        ) : (
          <span className={styles.date}>{formatDate(chat.updatedAt)}</span>
        )}
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
            <IconPencil size={14} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            aria-label="Удалить"
            title="Удалить"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const ChatItem = memo(ChatItemComponent);
export default ChatItem;
