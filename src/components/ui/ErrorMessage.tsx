import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>{message}</span>
      {onRetry && (
        <button className={styles.retry} onClick={onRetry} type="button">
          Повторить
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
