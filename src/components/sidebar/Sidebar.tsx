import { useState } from "react";
import { Button } from "../ui";
import SearchInput from "./SearchInput";
import ChatList from "./ChatList";
import { MOCK_CHATS } from "../../mocks/chats";
import type { Chat } from "../../types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_CHATS[0].id);
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
    setActiveChatId(newChat.id);
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
      if (activeChatId === id) {
        setActiveChatId(chats.find((c) => c.id !== id)?.id ?? null);
      }
    }
  };

  return (
    <>
      {/* Оверлей для мобильных */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Заголовок */}
        <div className={styles.header}>
          <span className={styles.brand}>✦ GigaChat</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {/* Новый чат */}
        <div className={styles.newChat}>
          <Button variant="primary" onClick={handleNewChat} className={styles.newChatBtn}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Новый чат
          </Button>
        </div>

        {/* Поиск */}
        <div className={styles.search}>
          <SearchInput value={search} onChange={setSearch} />
        </div>

        {/* Список чатов */}
        <div className={styles.chatListWrapper}>
          <p className={styles.sectionLabel}>Последние чаты</p>
          <ChatList
            chats={filtered}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
