import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}

// Вариант кнопки задаёт CSS-класс из модуля стилей
const Button = ({ variant = "primary", children, className, ...rest }: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
