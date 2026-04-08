import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
  isVisible?: boolean;
}

const TypingIndicator = ({ isVisible = true }: TypingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
};

export default TypingIndicator;
