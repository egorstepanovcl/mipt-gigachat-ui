import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";

// ── Моки внешних зависимостей ──────────────────────────────────────────────────

vi.mock("../../app/providers/ChatProvider", () => ({
  useChatState: vi.fn(),
  useChatDispatch: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

import {
  useChatState,
  useChatDispatch,
} from "../../app/providers/ChatProvider";
import { useNavigate } from "react-router-dom";

// ── Хелперы ────────────────────────────────────────────────────────────────────

const makeChat = (id: string, title: string) => ({
  id,
  title,
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const DEFAULT_CHATS = [
  makeChat("c1", "React hooks tutorial"),
  makeChat("c2", "Python basics"),
  makeChat("c3", "Vue.js guide"),
];

const DEFAULT_PROPS = {
  isOpen: true,
  onClose: vi.fn(),
  onSelectChat: vi.fn(),
};

// ── Настройка моков перед каждым тестом ────────────────────────────────────────

beforeEach(() => {
  vi.mocked(useChatState).mockReturnValue({
    chats: DEFAULT_CHATS,
    activeChatId: null,
    messagesByChat: {},
    isLoading: false,
    error: null,
  });
  vi.mocked(useChatDispatch).mockReturnValue(vi.fn());
  vi.mocked(useNavigate).mockReturnValue(vi.fn());
});

// ── Тесты поиска ───────────────────────────────────────────────────────────────

describe("Sidebar — поиск чатов", () => {
  it("при пустом поисковом запросе отображаются все чаты", () => {
    render(<Sidebar {...DEFAULT_PROPS} />);

    expect(screen.getByText("React hooks tutorial")).toBeInTheDocument();
    expect(screen.getByText("Python basics")).toBeInTheDocument();
    expect(screen.getByText("Vue.js guide")).toBeInTheDocument();
  });

  it("при вводе текста в поле поиска список фильтруется по названию", () => {
    render(<Sidebar {...DEFAULT_PROPS} />);

    const searchInput = screen.getByPlaceholderText("Поиск чатов...");
    fireEvent.change(searchInput, { target: { value: "react" } });

    expect(screen.getByText("React hooks tutorial")).toBeInTheDocument();
    expect(screen.queryByText("Python basics")).not.toBeInTheDocument();
    expect(screen.queryByText("Vue.js guide")).not.toBeInTheDocument();
  });

  it("поиск работает без учёта регистра", () => {
    render(<Sidebar {...DEFAULT_PROPS} />);

    const searchInput = screen.getByPlaceholderText("Поиск чатов...");
    fireEvent.change(searchInput, { target: { value: "PYTHON" } });

    expect(screen.getByText("Python basics")).toBeInTheDocument();
    expect(screen.queryByText("React hooks tutorial")).not.toBeInTheDocument();
  });

  it("при запросе без совпадений показывается сообщение об отсутствии чатов", () => {
    render(<Sidebar {...DEFAULT_PROPS} />);

    const searchInput = screen.getByPlaceholderText("Поиск чатов...");
    fireEvent.change(searchInput, { target: { value: "несуществующий чат" } });

    expect(screen.getByText("Чаты не найдены")).toBeInTheDocument();
  });
});

// ── Тесты удаления ─────────────────────────────────────────────────────────────

describe("Sidebar — удаление чата", () => {
  it("при нажатии кнопки «Удалить» появляется запрос на подтверждение", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Sidebar {...DEFAULT_PROPS} />);

    // Кнопка удаления видна при наведении — симулируем hover на первый чат
    const chatItem = screen.getByText("React hooks tutorial").closest("[role=button]") as HTMLElement;
    fireEvent.mouseEnter(chatItem);

    const deleteBtn = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalledOnce();

    confirmSpy.mockRestore();
  });

  it("при отмене подтверждения удаление не выполняется", () => {
    const dispatch = vi.fn();
    vi.mocked(useChatDispatch).mockReturnValue(dispatch);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Sidebar {...DEFAULT_PROPS} />);

    const chatItem = screen.getByText("React hooks tutorial").closest("[role=button]") as HTMLElement;
    fireEvent.mouseEnter(chatItem);
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "DELETE_CHAT" })
    );

    vi.restoreAllMocks();
  });

  it("при подтверждении удаления диспетчируется действие DELETE_CHAT", () => {
    const dispatch = vi.fn();
    vi.mocked(useChatDispatch).mockReturnValue(dispatch);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<Sidebar {...DEFAULT_PROPS} />);

    const chatItem = screen.getByText("React hooks tutorial").closest("[role=button]") as HTMLElement;
    fireEvent.mouseEnter(chatItem);
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    expect(dispatch).toHaveBeenCalledWith({ type: "DELETE_CHAT", payload: "c1" });

    vi.restoreAllMocks();
  });
});
