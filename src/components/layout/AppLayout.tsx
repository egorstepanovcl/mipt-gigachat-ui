import { lazy, Suspense, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ChatWindow from "../chat/ChatWindow";
import { EmptyState } from "../chat/EmptyState";
import { useChatState } from "../../app/providers/ChatProvider";
import LoadingFallback from "../ui/LoadingFallback";
import type { Theme } from "../../types";
import styles from "./AppLayout.module.css";

// Ленивая загрузка боковой панели и настроек
const Sidebar = lazy(() => import("../sidebar/Sidebar"));
const SettingsPanel = lazy(() =>
  import("../settings/SettingsPanel").then((m) => ({ default: m.SettingsPanel }))
);

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

  // Переходим к выбранному чату и закрываем сайдбар
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
        <Suspense fallback={<LoadingFallback />}>
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectChat={handleSelectChat}
          />
        </Suspense>
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
          <span className={styles.topbarTitle}>GigaChat</span>
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

      <Suspense fallback={null}>
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </Suspense>
    </div>
  );
};

export default AppLayout;
