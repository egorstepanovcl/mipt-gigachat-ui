import { Navigate, useParams } from "react-router-dom";
import { useChatState, useChatDispatch } from "../providers/ChatProvider";
import { useEffect } from "react";

export default function ChatRoute() {
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
