import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveState, loadState } from "./storage";
import type { ChatState } from "../types";

const STORAGE_KEY = "gigachat-ui-state";

function makeState(overrides: Partial<ChatState> = {}): ChatState {
  return {
    chats: [],
    activeChatId: null,
    messagesByChat: {},
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function makeMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key in store) delete store[key];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

describe("saveState", () => {
  let mockStorage: ReturnType<typeof makeMockLocalStorage>;

  beforeEach(() => {
    mockStorage = makeMockLocalStorage();
    vi.stubGlobal("localStorage", mockStorage);
  });

  it("сохраняет chats, activeChatId и messagesByChat в localStorage", () => {
    const state = makeState({
      chats: [{ id: "c1", title: "Chat 1", messages: [], createdAt: 1000, updatedAt: 1000 }],
      activeChatId: "c1",
      messagesByChat: {
        c1: [{ id: "m1", role: "user", content: "Hello", timestamp: 1000 }],
      },
    });

    saveState(state);

    expect(mockStorage.setItem).toHaveBeenCalledOnce();
    const [key, value] = mockStorage.setItem.mock.calls[0];
    expect(key).toBe(STORAGE_KEY);

    const parsed = JSON.parse(value);
    expect(parsed.chats).toHaveLength(1);
    expect(parsed.chats[0].id).toBe("c1");
    expect(parsed.activeChatId).toBe("c1");
    expect(parsed.messagesByChat.c1).toHaveLength(1);
    expect(parsed.messagesByChat.c1[0].content).toBe("Hello");
  });

  it("не сохраняет isLoading и error", () => {
    const state = makeState({ isLoading: true, error: "some error" });
    saveState(state);

    const [, value] = mockStorage.setItem.mock.calls[0];
    const parsed = JSON.parse(value);
    expect(parsed).not.toHaveProperty("isLoading");
    expect(parsed).not.toHaveProperty("error");
  });

  it("не выбрасывает исключение при ошибке записи", () => {
    mockStorage.setItem.mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveState(makeState())).not.toThrow();
  });
});

describe("loadState", () => {
  let mockStorage: ReturnType<typeof makeMockLocalStorage>;

  beforeEach(() => {
    mockStorage = makeMockLocalStorage();
    vi.stubGlobal("localStorage", mockStorage);
  });

  it("возвращает null, если localStorage пуст", () => {
    expect(loadState()).toBeNull();
  });

  it("корректно восстанавливает сохранённое состояние", () => {
    const persisted = {
      chats: [{ id: "c1", title: "Chat 1", messages: [], createdAt: 1000, updatedAt: 1000 }],
      activeChatId: "c1",
      messagesByChat: {
        c1: [{ id: "m1", role: "user", content: "Hi", timestamp: 1000 }],
      },
    };
    mockStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    // Сбросим счётчик вызовов после ручной записи
    mockStorage.getItem.mockReturnValueOnce(JSON.stringify(persisted));

    const result = loadState();

    expect(result).not.toBeNull();
    expect(result!.chats).toHaveLength(1);
    expect(result!.chats![0].id).toBe("c1");
    expect(result!.activeChatId).toBe("c1");
    expect(result!.messagesByChat!.c1).toHaveLength(1);
  });

  it("сохранение и последующая загрузка возвращают те же данные", () => {
    const state = makeState({
      chats: [{ id: "c2", title: "Test", messages: [], createdAt: 2000, updatedAt: 2000 }],
      activeChatId: "c2",
      messagesByChat: { c2: [] },
    });

    // Имитируем полный цикл: save → load
    let stored = "";
    mockStorage.setItem.mockImplementation((_key: string, value: string) => {
      stored = value;
    });
    mockStorage.getItem.mockImplementation(() => stored || (null as unknown as string));

    saveState(state);
    const loaded = loadState();

    expect(loaded).not.toBeNull();
    expect(loaded!.chats![0].id).toBe("c2");
    expect(loaded!.activeChatId).toBe("c2");
  });

  it("возвращает null при невалидном JSON (битые данные)", () => {
    mockStorage.getItem.mockReturnValue("{ broken json {{");
    expect(loadState()).toBeNull();
  });

  it("возвращает null, если данные не содержат chats", () => {
    mockStorage.getItem.mockReturnValue(JSON.stringify({ activeChatId: "c1" }));
    expect(loadState()).toBeNull();
  });

  it("возвращает null, если chats не массив", () => {
    mockStorage.getItem.mockReturnValue(JSON.stringify({ chats: "not-an-array" }));
    expect(loadState()).toBeNull();
  });

  it("не выбрасывает исключение при ошибке чтения", () => {
    mockStorage.getItem.mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => loadState()).not.toThrow();
    expect(loadState()).toBeNull();
  });
});
