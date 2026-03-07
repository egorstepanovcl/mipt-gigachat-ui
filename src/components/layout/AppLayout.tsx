import { Button, Toggle, Slider, ErrorMessage } from "../ui";
import { useState } from "react";
import type { Theme } from "../../types";

interface AppLayoutProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const AppLayout = ({ theme, onToggleTheme }: AppLayoutProps) => {
  const [sliderVal, setSliderVal] = useState(1.0);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Toggle checked={theme === "dark"} onChange={onToggleTheme} label="Тёмная тема" />
      <Slider min={0} max={2} step={0.1} value={sliderVal} onChange={setSliderVal} label="Temperature" />
      <ErrorMessage message="Что-то пошло не так" />
    </div>
  );
};

export default AppLayout;
