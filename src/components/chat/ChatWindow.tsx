import { IconSettings } from "../ui/Icon";
import MessageList from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChat } from "../../hooks/useChat";
import { useChatState } from "../../app/providers/ChatProvider";
import { useSettings } from "../../app/providers/SettingsProvider";
import styles from "./ChatWindow.module.css";

interface ChatWindowProps {
  chatTitle?: string;
  onOpenSettings?: () => void;
}

const ChatWindow = ({
  chatTitle = "Как работает React Suspense?",
  onOpenSettings,
}: ChatWindowProps) => {
  const { activeChatId } = useChatState();
  const { settings } = useSettings();

  const { messages, input, setInput, sendMessage, isLoading, stop } = useChat({
    chatId: activeChatId!,
    settings,
  });

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

      <MessageList messages={messages} isTyping={isLoading} />

      <div className={styles.inputWrapper}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          onStop={stop}
          disabled={isLoading}
          maxLength={4000}
          onTyping={() => {}}
          onFilesDrop={(files) => console.log("files:", files)}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
