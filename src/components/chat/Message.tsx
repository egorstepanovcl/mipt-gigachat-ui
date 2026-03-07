import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { MessageRole } from "../../types";
import styles from "./Message.module.css";

interface MessageProps {
  variant: MessageRole;
  content: string;
  sender: string;
  timestamp?: number;
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Иконка GigaChat для ассистента
const AssistantAvatar = () => (
  <div className={styles.avatar} aria-label="GigaChat">
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <circle cx="12" cy="12" r="10" fill="var(--color-primary)" />
      <path
        d="M8 12h8M12 8v8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const Message = ({ variant, content, sender, timestamp }: MessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = variant === "user";

  return (
    <div
      className={`${styles.wrapper} ${isUser ? styles.wrapperUser : styles.wrapperAssistant}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Аватар ассистента */}
      {!isUser && <AssistantAvatar />}

      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {/* Имя отправителя */}
        <div className={styles.sender}>{sender}</div>

        {/* Контент с Markdown */}
        <div className={styles.content}>
          <ReactMarkdown
            components={{
              // Блок кода
              code({ className, children, ...props }) {
                const isBlock = className?.includes("language-");
                return isBlock ? (
                  <pre className={styles.codeBlock}>
                    <code className={styles.codeInner} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className={styles.codeInline} {...props}>
                    {children}
                  </code>
                );
              },
              // Ссылки — открывать в новой вкладке
              a({ href, children }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {children}
                  </a>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Футер: время + кнопка копирования */}
        <div className={styles.footer}>
        {timestamp && (
            <span className={styles.time}>{formatTime(timestamp)}</span>
        )}
        <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ""} ${isHovered ? styles.copyBtnVisible : ""}`}
            onClick={handleCopy}
            aria-label="Копировать"
            title="Копировать"
        >
            {copied ? (
            <>
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Скопировано
            </>
            ) : (
            <>
                <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v7A1.5 1.5 0 003.5 12H5" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                Копировать
            </>
            )}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
