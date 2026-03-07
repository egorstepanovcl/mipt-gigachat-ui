import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import Message from "../chat/Message";
import { MOCK_MESSAGES } from "../../mocks/messages";
import type { Theme } from "../../types";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        {/* Шапка (мобильная) */}
        <header className={styles.topbar}>
          <button
            className={styles.burgerBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <span className={styles.topbarTitle}>GigaChat UI</span>
        </header>

        {/* Временная проверка Message */}
        <div className={styles.placeholder}>
          {MOCK_MESSAGES.map((msg) => (
            <Message
              key={msg.id}
              variant={msg.role}
              content={msg.content}
              sender={msg.role === "user" ? "Вы" : "GigaChat"}
              timestamp={msg.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
