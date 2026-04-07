import styles from "./LoadingFallback.module.css";

interface LoadingFallbackProps {
  size?: "small" | "medium" | "large";
}

const LoadingFallback = ({ size = "medium" }: LoadingFallbackProps) => {
  return (
    <div className={`${styles.wrapper} ${styles[size]}`} aria-label="Загрузка...">
      <div className={styles.spinner} />
    </div>
  );
};

export default LoadingFallback;
