import { useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import AuthForm from "./components/auth/AuthForm";
import { ChatProvider } from "./app/providers/ChatProvider";
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
    <ChatProvider>
      <AppLayout onToggleTheme={handleToggleTheme} theme={theme} />
    </ChatProvider>
  );
}

export default App;
