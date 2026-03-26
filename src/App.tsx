import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthForm from "./components/auth/AuthForm";
import { ChatProvider } from "./app/providers/ChatProvider";
import { SettingsProvider } from "./app/providers/SettingsProvider";
import { restoreCredentials } from "./api/gigachat";
import { IndexRoute, ChatRoute } from "./app/router/routes";
import type { Theme } from "./types";
import "./styles/theme.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => restoreCredentials());
  const [theme, setTheme] = useState<Theme>("light");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleToggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <SettingsProvider>
        <ChatProvider>
          <Routes>
            <Route element={<AppLayout onToggleTheme={handleToggleTheme} theme={theme} />}>
              <Route index element={<IndexRoute />} />
              <Route path="chat/:id" element={<ChatRoute />} />
            </Route>
          </Routes>
        </ChatProvider>
      </SettingsProvider>
    </HashRouter>
  );
}

export default App;
