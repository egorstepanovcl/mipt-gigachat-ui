import { lazy, Suspense, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import AuthForm from "./components/auth/AuthForm";
import { ChatProvider } from "./app/providers/ChatProvider";
import { SettingsProvider } from "./app/providers/SettingsProvider";
import { restoreCredentials } from "./api/gigachat";
import LoadingFallback from "./components/ui/LoadingFallback";
import type { Theme } from "./types";
import "./styles/theme.css";

const AppLayout = lazy(() => import("./components/layout/AppLayout"));
const IndexRoute = lazy(() => import("./app/router/IndexRoute"));
const ChatRoute = lazy(() => import("./app/router/ChatRoute"));

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
          <Suspense fallback={<LoadingFallback size="large" />}>
            <Routes>
              <Route element={<AppLayout onToggleTheme={handleToggleTheme} theme={theme} />}>
                <Route index element={
                  <Suspense fallback={null}>
                    <IndexRoute />
                  </Suspense>
                } />
                <Route path="chat/:id" element={
                  <Suspense fallback={null}>
                    <ChatRoute />
                  </Suspense>
                } />
              </Route>
            </Routes>
          </Suspense>
        </ChatProvider>
      </SettingsProvider>
    </HashRouter>
  );
}

export default App;
