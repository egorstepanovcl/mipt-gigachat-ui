import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { MOCK_CHATS } from "../../mocks/chats";
import type { ChatState, ChatAction } from "../../types";

const initialState: ChatState = {
  chats: MOCK_CHATS,
  activeChatId: "1",
  messagesByChat: {},
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "CREATE_CHAT":
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
        messagesByChat: {
          ...state.messagesByChat,
          [action.payload.id]: [],
        },
      };

    case "DELETE_CHAT": {
      const filtered = state.chats.filter((c) => c.id !== action.payload);
      const newMessages = { ...state.messagesByChat };
      delete newMessages[action.payload];
      return {
        ...state,
        chats: filtered,
        messagesByChat: newMessages,
        activeChatId:
          state.activeChatId === action.payload
            ? (filtered[0]?.id ?? null)
            : state.activeChatId,
      };
    }

    case "RENAME_CHAT":
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.payload.id
            ? { ...c, title: action.payload.title, updatedAt: Date.now() }
            : c
        ),
      };

    case "SET_ACTIVE_CHAT":
      return { ...state, activeChatId: action.payload };

    case "ADD_MESSAGE": {
      const { chatId, message } = action.payload;
      const existing = state.messagesByChat[chatId] ?? [];
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: [...existing, message],
        },
      };
    }

    case "UPDATE_MESSAGE": {
      const { chatId, messageId, content } = action.payload;
      const msgs = state.messagesByChat[chatId];
      if (!msgs) return state;
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: msgs.map((m) =>
            m.id === messageId ? { ...m, content } : m
          ),
        },
      };
    }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

const ChatStateContext = createContext<ChatState | null>(null);
const ChatDispatchContext = createContext<Dispatch<ChatAction> | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

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
