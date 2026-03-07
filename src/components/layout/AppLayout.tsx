import type { Theme } from "../../types";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  return (
    <div>
      <p>AppLayout — TODO (тема: {theme})</p>
      <button onClick={onToggleTheme}>Сменить тему</button>
    </div>
  );
};

export default AppLayout;
