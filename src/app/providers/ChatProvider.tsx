import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { ChatState, ChatAction } from "../../types";
import { loadState, saveState } from "../../utils/storage";
import { chatReducer, defaultState } from "../../store/chatReducer";

function getInitialState(): ChatState {
  const saved = loadState();
  if (!saved) return defaultState;

  return {
    ...defaultState,
    chats: saved.chats ?? defaultState.chats,
    activeChatId: saved.activeChatId ?? defaultState.activeChatId,
    messagesByChat: saved.messagesByChat ?? defaultState.messagesByChat,
  };
}

const ChatStateContext = createContext<ChatState | null>(null);
const ChatDispatchContext = createContext<Dispatch<ChatAction> | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, getInitialState);

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
