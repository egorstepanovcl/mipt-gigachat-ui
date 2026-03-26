import { useState } from "react";
import { IconCopy, IconCheck } from "../ui/Icon";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
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
    <span className={styles.avatarIcon}>✦</span>
  </div>
);

const Message = ({ variant, content, sender, timestamp }: MessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";

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
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              // Блок кода с подсветкой синтаксиса
              code({ className, children, ...props }) {
                const match = className?.match(/language-(\w+)/);
                return match ? (
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={match[1]}
                    PreTag="div"
                    className={styles.codeBlock}
                    customStyle={{ margin: 0, background: "none" }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
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
              <><IconCheck size={13} /> Скопировано</>
            ) : (
              <><IconCopy size={13} /> Копировать</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
