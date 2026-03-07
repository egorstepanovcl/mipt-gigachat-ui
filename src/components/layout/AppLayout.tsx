import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import ChatWindow from "../chat/ChatWindow";
import { SettingsPanel } from "../settings/SettingsPanel";
import type { Theme } from "../../types";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

        <ChatWindow onOpenSettings={() => setSettingsOpen(true)} />
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
