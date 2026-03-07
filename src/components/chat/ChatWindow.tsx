import { useState } from "react";
import { IconSettings } from "../ui/Icon";
import MessageList from "./MessageList";
import { MOCK_MESSAGES } from "../../mocks/messages";
import type { Message } from "../../types";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  chatTitle?: string;
  onOpenSettings?: () => void;
}

const ChatWindow = ({
  chatTitle = "Как работает React Suspense?",
  onOpenSettings,
}: ChatWindowProps) => {
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [isTyping] = useState(true);

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{chatTitle}</h2>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.settingsBtn}
            onClick={onOpenSettings}
            aria-label="Настройки"
            title="Настройки"
          >
            <IconSettings size={18} />
          </button>
        </div>
      </header>

      <MessageList messages={messages} isTyping={isTyping} />

      <div className={styles.inputPlaceholder}>
        <span>InputArea — TODO</span>
      </div>
    </div>
  );
};

export default ChatWindow;
