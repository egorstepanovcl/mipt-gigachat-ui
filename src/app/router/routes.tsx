import { Navigate, useParams } from "react-router-dom";
import {
  useChatState,
  useChatDispatch,
} from "../providers/ChatProvider";
import { useEffect } from "react";

export function IndexRoute() {
  const { activeChatId, chats } = useChatState();

  if (activeChatId && chats.some((c) => c.id === activeChatId)) {
    return <Navigate to={`/chat/${activeChatId}`} replace />;
  }

  if (chats.length > 0) {
    return <Navigate to={`/chat/${chats[0].id}`} replace />;
  }

  return null;
}

export function ChatRoute() {
  const { id } = useParams<{ id: string }>();
  const { chats, activeChatId } = useChatState();
  const dispatch = useChatDispatch();

  const chatExists = chats.some((c) => c.id === id);

  useEffect(() => {
    if (id && chatExists && activeChatId !== id) {
      dispatch({ type: "SET_ACTIVE_CHAT", payload: id });
    }
  }, [id, chatExists, activeChatId, dispatch]);

  if (!chatExists) {
    return <Navigate to="/" replace />;
  }

  return null;
}
