import styles from "./EmptyState.module.css";
import { IconChat } from "../ui/Icon";

export const EmptyState = () => (
  <div className={styles.wrapper}>
    <div className={styles.icon}>
      <IconChat size={48} />
    </div>
    <h2 className={styles.title}>Начните новый диалог</h2>
    <p className={styles.subtitle}>
      Выберите чат из списка или создайте новый
    </p>
  </div>
);
