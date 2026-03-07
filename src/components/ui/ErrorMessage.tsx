import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (!message) return null;

  return (
    <div className={styles.error} role="alert">
      <span className={styles.icon}>⚠</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
