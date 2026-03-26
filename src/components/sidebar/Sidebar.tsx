import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconClose } from "../ui/Icon";
import { Button } from "../ui";
import SearchInput from "./SearchInput";
import ChatList from "./ChatList";
import {
  useChatState,
  useChatDispatch,
} from "../../app/providers/ChatProvider";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (id: string) => void;
}

const Sidebar = ({ isOpen: _isOpen, onClose, onSelectChat }: SidebarProps) => {
  const { chats, activeChatId } = useChatState();
  const dispatch = useChatDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "Новый чат",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: "CREATE_CHAT", payload: newChat });
    navigate(`/chat/${newChat.id}`);
  };

  const handleEdit = (id: string) => {
    const title = prompt("Введите новое название:");
    if (title?.trim()) {
      dispatch({
        type: "RENAME_CHAT",
        payload: { id, title: title.trim() },
      });
    }
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Удалить этот чат?");
    if (confirmed) {
      const wasActive = activeChatId === id;
      dispatch({ type: "DELETE_CHAT", payload: id });
      if (wasActive) {
        const remaining = chats.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          navigate(`/chat/${remaining[0].id}`);
        } else {
          navigate("/");
        }
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
          activeChatId={activeChatId}
          onSelect={onSelectChat}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
