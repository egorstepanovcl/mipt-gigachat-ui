import styles from "./Slider.module.css";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const Slider = ({ min, max, step = 0.1, value, onChange, label }: SliderProps) => {
  // Вычисляем позицию ползунка для кастомной заливки через CSS-переменную
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.wrapper}>
      {label && (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value.toFixed(1)}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
        style={{ "--percent": `${percent}%` } as React.CSSProperties}
      />
    </div>
  );
};

export default Slider;
