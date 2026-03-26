import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import { SettingsPanel } from "../settings/SettingsPanel";
import { EmptyState } from "../chat/EmptyState";
import { useChatState } from "../../app/providers/ChatProvider";
import type { Theme } from "../../types";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const { activeChatId, chats } = useChatState();

  const activeChat = chats.find((c) => c.id === activeChatId);

  const handleSelectChat = (id: string) => {
    navigate(`/chat/${id}`);
    setSidebarOpen(false);
  };

  return (
    <div className={styles.layout}>
      <Outlet />

      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ""}`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectChat={handleSelectChat}
        />
      </aside>

      <div className={styles.main}>
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

        {activeChatId ? (
          <ChatWindow
            chatTitle={activeChat?.title}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    </div>
  );
};

export default AppLayout;
