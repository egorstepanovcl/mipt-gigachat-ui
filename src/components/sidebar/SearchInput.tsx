import { IconSearch, IconClose } from "../ui/Icon";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>
        <IconSearch size={24} />
      </span>
      <input
        type="text"
        className={styles.input}
        placeholder="Поиск чатов..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className={styles.clear} onClick={() => onChange("")} aria-label="Очистить">
          <IconClose size={12} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
