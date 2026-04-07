import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { Chat, ChatState, ChatAction } from "../../types";
import { loadState, saveState } from "../../utils/storage";
import { chatReducer, defaultState } from "../../store/chatReducer";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeInitialChat(): Chat {
  return {
    id: generateId(),
    title: "Новый чат",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Загружаем сохранённое состояние или создаём чат по умолчанию
function getInitialState(): ChatState {
  const saved = loadState();

  if (saved?.chats && saved.chats.length > 0) {
    return {
      ...defaultState,
      chats: saved.chats,
      activeChatId: saved.activeChatId ?? saved.chats[0].id,
      messagesByChat: saved.messagesByChat ?? {},
    };
  }

  const chat = makeInitialChat();
  return {
    ...defaultState,
    chats: [chat],
    activeChatId: chat.id,
    messagesByChat: { [chat.id]: [] },
  };
}

// Разделяем контексты состояния и dispatch для оптимизации ререндеров
const ChatStateContext = createContext<ChatState | null>(null);
const ChatDispatchContext = createContext<Dispatch<ChatAction> | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, getInitialState);

  // Сохраняем в localStorage при каждом изменении состояния
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  );
}

export function useChatState(): ChatState {
  const ctx = useContext(ChatStateContext);
  if (!ctx) throw new Error("useChatState must be used within ChatProvider");
  return ctx;
}

export function useChatDispatch(): Dispatch<ChatAction> {
  const ctx = useContext(ChatDispatchContext);
  if (!ctx)
    throw new Error("useChatDispatch must be used within ChatProvider");
  return ctx;
}
