import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import { SettingsPanel } from "../settings/SettingsPanel";
import { EmptyState } from "../chat/EmptyState";
import type { Theme } from "../../types";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>("1");

  return (
    <div className={styles.layout}>

      <div
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayVisible : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ""}`}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setSidebarOpen(false);
          }}
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
          <ChatWindow onOpenSettings={() => setSettingsOpen(true)} />
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
