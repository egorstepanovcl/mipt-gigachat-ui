import { useState } from "react";
import { Button, ErrorMessage } from "../ui";
import {
  authenticate,
  setCredentials as storeCredentials,
  setProxyUrls,
} from "../../api/gigachat";
import type { Scope } from "../../types";
import styles from "./AuthForm.module.css";

interface AuthFormProps {
  onLogin: () => void;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: "GIGACHAT_API_PERS", label: "Personal" },
  { value: "GIGACHAT_API_B2B", label: "B2B" },
  { value: "GIGACHAT_API_CORP", label: "Corporate" },
];

// В dev-режиме скрываем поле Proxy URL — Vite сам проксирует запросы
const IS_DEV = import.meta.env.DEV;

const AuthForm = ({ onLogin }: AuthFormProps) => {
  const [credentials, setCredentials] = useState("");
  const [scope, setScope] = useState<Scope>("GIGACHAT_API_PERS");
  const [proxyUrl, setProxyUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!credentials.trim()) {
      setError("Поле Credentials не может быть пустым");
      return;
    }

    if (!IS_DEV && !proxyUrl.trim()) {
      setError("Укажите URL прокси-сервера для работы вне dev-режима");
      return;
    }

    if (!IS_DEV && proxyUrl.trim()) {
      const base = proxyUrl.trim().replace(/\/+$/, "");
      setProxyUrls(base, base);
    }

    setIsLoading(true);
    try {
      await authenticate(credentials.trim(), scope);
      storeCredentials(credentials.trim(), scope);
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Логотип / заголовок */}
        <div className={styles.header}>
          <div className={styles.logo}>✦</div>
          <h1 className={styles.title}>GigaChat UI</h1>
          <p className={styles.subtitle}>Введите учётные данные для доступа к API</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Credentials */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="credentials">
              Credentials
              <span className={styles.hint}>(Base64-строка)</span>
            </label>
            <input
              id="credentials"
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Вставьте ваш Base64 ключ"
              value={credentials}
              onChange={(e) => {
                setCredentials(e.target.value);
                if (error) setError("");
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Proxy URL (только в production) */}
          {!IS_DEV && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="proxyUrl">
                Proxy URL
                <span className={styles.hint}>(CORS-прокси)</span>
              </label>
              <input
                id="proxyUrl"
                type="url"
                className={styles.input}
                placeholder="https://your-proxy.example.com"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}

          {/* Error */}
          {error && <ErrorMessage message={error} />}

          {/* Scope */}
          <div className={styles.field}>
            <span className={styles.label}>Scope</span>
            <div className={styles.radioGroup}>
              {SCOPES.map(({ value, label }) => (
                <label key={value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="scope"
                    value={value}
                    checked={scope === value}
                    onChange={() => setScope(value)}
                    className={styles.radio}
                  />
                  <span className={styles.radioText}>
                    <strong>{label}</strong>
                    <code className={styles.radioCode}>{value}</code>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? "Подключение..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
