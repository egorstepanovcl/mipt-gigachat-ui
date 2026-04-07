import type { ChatState } from "../types";

// Ключ хранилища в localStorage
const STORAGE_KEY = "gigachat-ui-state";

// Только нужные поля состояния — isLoading и error не сохраняем
interface PersistedState {
  chats: ChatState["chats"];
  activeChatId: ChatState["activeChatId"];
  messagesByChat: ChatState["messagesByChat"];
}

// Сохраняем состояние при каждом изменении
export function saveState(state: ChatState): void {
  const { chats, activeChatId, messagesByChat } = state;
  const persisted: PersistedState = { chats, activeChatId, messagesByChat };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {}
}

// Загружаем и валидируем сохранённое состояние
export function loadState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    // Минимальная проверка структуры
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "chats" in parsed &&
      Array.isArray((parsed as PersistedState).chats)
    ) {
      return parsed as PersistedState;
    }

    return null;
  } catch {
    return null;
  }
}
