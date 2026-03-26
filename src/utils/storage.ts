import type { ChatState } from "../types";

const STORAGE_KEY = "gigachat-ui-state";

interface PersistedState {
  chats: ChatState["chats"];
  activeChatId: ChatState["activeChatId"];
  messagesByChat: ChatState["messagesByChat"];
}

export function saveState(state: ChatState): void {
  const { chats, activeChatId, messagesByChat } = state;
  const persisted: PersistedState = { chats, activeChatId, messagesByChat };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {}
}

export function loadState(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

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
