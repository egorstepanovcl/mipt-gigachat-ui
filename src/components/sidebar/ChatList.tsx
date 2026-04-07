import type { Chat } from "../../types";
import ChatItem from "./ChatItem";
import styles from "./ChatList.module.css";

type ChatWithSnippet = Chat & { snippet?: string };

interface ChatListProps {
  chats: ChatWithSnippet[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  search?: string;
}

const ChatList = ({ chats, activeChatId, onSelect, onEdit, onDelete }: ChatListProps) => {
  if (chats.length === 0) {
    return (
      <div className={styles.empty}>
        <span>Чаты не найдены</span>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          snippet={chat.snippet}
        />
      ))}
    </div>
  );
};

export default ChatList;
