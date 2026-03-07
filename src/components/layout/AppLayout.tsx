import { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
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

        {/* Заглушка — сюда придёт ChatWindow */}
        <div className={styles.placeholder}>
          <p>ChatWindow — TODO</p>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
