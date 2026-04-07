import { Navigate } from "react-router-dom";
import { useChatState } from "../providers/ChatProvider";

export default function IndexRoute() {
  const { activeChatId, chats } = useChatState();

  if (activeChatId && chats.some((c) => c.id === activeChatId)) {
    return <Navigate to={`/chat/${activeChatId}`} replace />;
  }

  if (chats.length > 0) {
    return <Navigate to={`/chat/${chats[0].id}`} replace />;
  }

  return null;
}
