import { useState, useMemo, useCallback } from "react";
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
  const { chats, activeChatId, messagesByChat } = useChatState();
  const dispatch = useChatDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Фильтрация чатов по заголовку и содержимому сообщений с формированием сниппета
  const filtered = useMemo(() => {
    if (!search.trim()) return chats.map((c) => ({ ...c, snippet: undefined }));
    const q = search.toLowerCase();
    return chats.reduce<(typeof chats[0] & { snippet?: string })[]>((acc, chat) => {
      if (chat.title.toLowerCase().includes(q)) {
        acc.push({ ...chat, snippet: undefined });
        return acc;
      }
      const msgs = messagesByChat[chat.id] ?? [];
      const match = msgs.find((m) => m.content.toLowerCase().includes(q));
      if (match) {
        // Вырезаем контекст вокруг найденного слова
        const idx = match.content.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 20);
        const end = Math.min(match.content.length, idx + q.length + 30);
        let snippet = match.content.slice(start, end).replace(/\n+/g, " ");
        if (start > 0) snippet = "…" + snippet;
        if (end < match.content.length) snippet += "…";
        acc.push({ ...chat, snippet });
      }
      return acc;
    }, []);
  }, [chats, messagesByChat, search]);

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: Date.now().toString(),
      title: "Новый чат",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: "CREATE_CHAT", payload: newChat });
    navigate(`/chat/${newChat.id}`);
  }, [dispatch, navigate]);

  const handleEdit = useCallback((id: string) => {
    const title = prompt("Введите новое название:");
    if (title?.trim()) {
      dispatch({
        type: "RENAME_CHAT",
        payload: { id, title: title.trim() },
      });
    }
  }, [dispatch]);

  const handleDelete = useCallback((id: string) => {
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
  }, [activeChatId, chats, dispatch, navigate]);

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
          search={search}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
