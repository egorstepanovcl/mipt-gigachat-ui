import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthForm from "./components/auth/AuthForm";
import { ChatProvider } from "./app/providers/ChatProvider";
import { IndexRoute, ChatRoute } from "./app/router/routes";
import type { Theme } from "./types";
import "./styles/theme.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      <ChatProvider>
        <Routes>
          <Route element={<AppLayout onToggleTheme={handleToggleTheme} theme={theme} />}>
            <Route index element={<IndexRoute />} />
            <Route path="chat/:id" element={<ChatRoute />} />
          </Route>
        </Routes>
      </ChatProvider>
    </HashRouter>
  );
}

export default App;
