import { useState } from "react";
import { IconPlus, IconClose } from "../ui/Icon";
import { Button } from "../ui";
import SearchInput from "./SearchInput";
import ChatList from "./ChatList";
import { MOCK_CHATS } from "../../mocks/chats";
import type { Chat } from "../../types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelectChat: (id: string) => void;
}

const Sidebar = ({ isOpen: _isOpen, onClose, activeId, onSelectChat }: SidebarProps) => {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "Новый чат",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    onSelectChat(newChat.id);
  };

  const handleEdit = (id: string) => {
    const title = prompt("Введите новое название:");
    if (title?.trim()) {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: title.trim() } : c))
      );
    }
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Удалить этот чат?");
    if (confirmed) {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        onSelectChat(chats.find((c) => c.id !== id)?.id ?? "");
      }
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.brand}>✦ GigaChat</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
          <IconClose size={16} />
        </button>
      </div>

      <div className={styles.newChat}>
        <Button variant="primary" onClick={handleNewChat} className={styles.newChatBtn}>
          <IconPlus size={14} />
          Новый чат
        </Button>
      </div>

      <div className={styles.search}>
        <SearchInput value={search} onChange={setSearch} />
      </div>

      <div className={styles.chatListWrapper}>
        <p className={styles.sectionLabel}>Последние чаты</p>
        <ChatList
          chats={filtered}
          activeChatId={activeId}
          onSelect={onSelectChat}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
