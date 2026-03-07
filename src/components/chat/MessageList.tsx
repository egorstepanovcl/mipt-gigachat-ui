import { useEffect, useRef } from "react";
import type { Message as MessageType } from "../../types";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList = ({ messages, isTyping = false }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Автоскролл при новом сообщении или печатании
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✦</div>
        <p className={styles.emptyTitle}>Начните новый диалог</p>
        <p className={styles.emptySubtitle}>Задайте вопрос — GigaChat ответит</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <Message
            key={msg.id}
            variant={msg.role}
            content={msg.content}
            sender={msg.role === "user" ? "Вы" : "GigaChat"}
            timestamp={msg.timestamp}
          />
        ))}

        <TypingIndicator isVisible={isTyping} />

        {/* Якорь для автоскролла */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
