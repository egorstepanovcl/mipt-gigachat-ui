import { describe, it, expect } from "vitest";
import { chatReducer, defaultState } from "./chatReducer";
import type { Chat, Message, ChatState } from "../types";

function makeChat(id: string, title = "Test Chat"): Chat {
  return { id, title, messages: [], createdAt: 1000, updatedAt: 1000 };
}

function makeMessage(id: string, content = "Hello"): Message {
  return { id, role: "user", content, timestamp: 1000 };
}

function stateWithChat(chat: Chat): ChatState {
  return chatReducer(defaultState, { type: "CREATE_CHAT", payload: chat });
}

// ── ADD_MESSAGE ────────────────────────────────────────────────────────────────

describe("ADD_MESSAGE", () => {
  it("увеличивает массив messages на 1", () => {
    const chat = makeChat("c1");
    const state = stateWithChat(chat);
    const message = makeMessage("m1");

    const next = chatReducer(state, {
      type: "ADD_MESSAGE",
      payload: { chatId: "c1", message },
    });

    expect(next.messagesByChat["c1"]).toHaveLength(1);
  });

  it("новое сообщение находится в конце массива", () => {
    const chat = makeChat("c1");
    let state = stateWithChat(chat);
    state = chatReducer(state, {
      type: "ADD_MESSAGE",
      payload: { chatId: "c1", message: makeMessage("m1", "First") },
    });

    const next = chatReducer(state, {
      type: "ADD_MESSAGE",
      payload: { chatId: "c1", message: makeMessage("m2", "Second") },
    });

    const msgs = next.messagesByChat["c1"];
    expect(msgs).toHaveLength(2);
    expect(msgs[msgs.length - 1].id).toBe("m2");
    expect(msgs[msgs.length - 1].content).toBe("Second");
  });

  it("не затрагивает сообщения других чатов", () => {
    const chat1 = makeChat("c1");
    const chat2 = makeChat("c2");
    let state = stateWithChat(chat1);
    state = chatReducer(state, { type: "CREATE_CHAT", payload: chat2 });

    const next = chatReducer(state, {
      type: "ADD_MESSAGE",
      payload: { chatId: "c1", message: makeMessage("m1") },
    });

    expect(next.messagesByChat["c2"]).toHaveLength(0);
  });
});

// ── CREATE_CHAT ────────────────────────────────────────────────────────────────

describe("CREATE_CHAT", () => {
  it("новый чат появляется в массиве chats", () => {
    const chat = makeChat("c1");
    const next = chatReducer(defaultState, {
      type: "CREATE_CHAT",
      payload: chat,
    });

    expect(next.chats).toHaveLength(1);
    expect(next.chats[0].id).toBe("c1");
  });

  it("каждый новый чат имеет уникальный id", () => {
    const chat1 = makeChat("c1");
    const chat2 = makeChat("c2");
    let state = chatReducer(defaultState, {
      type: "CREATE_CHAT",
      payload: chat1,
    });
    state = chatReducer(state, { type: "CREATE_CHAT", payload: chat2 });

    const ids = state.chats.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("новый чат становится активным", () => {
    const chat = makeChat("c1");
    const next = chatReducer(defaultState, {
      type: "CREATE_CHAT",
      payload: chat,
    });

    expect(next.activeChatId).toBe("c1");
  });

  it("инициализирует пустой массив сообщений для нового чата", () => {
    const chat = makeChat("c1");
    const next = chatReducer(defaultState, {
      type: "CREATE_CHAT",
      payload: chat,
    });

    expect(next.messagesByChat["c1"]).toEqual([]);
  });
});

// ── DELETE_CHAT ────────────────────────────────────────────────────────────────

describe("DELETE_CHAT", () => {
  it("чат удаляется из массива chats", () => {
    const chat = makeChat("c1");
    const state = stateWithChat(chat);

    const next = chatReducer(state, { type: "DELETE_CHAT", payload: "c1" });

    expect(next.chats.find((c) => c.id === "c1")).toBeUndefined();
  });

  it("при удалении активного чата activeChatId сбрасывается", () => {
    const chat = makeChat("c1");
    const state = stateWithChat(chat); // activeChatId === "c1"

    const next = chatReducer(state, { type: "DELETE_CHAT", payload: "c1" });

    expect(next.activeChatId).toBeNull();
  });

  it("при удалении активного чата activeChatId переключается на следующий", () => {
    const chat1 = makeChat("c1");
    const chat2 = makeChat("c2");
    let state = stateWithChat(chat1);
    state = chatReducer(state, { type: "CREATE_CHAT", payload: chat2 });
    // activeChatId === "c2" (последний созданный), chats = [c2, c1]
    state = chatReducer(state, { type: "SET_ACTIVE_CHAT", payload: "c2" });

    const next = chatReducer(state, { type: "DELETE_CHAT", payload: "c2" });

    expect(next.activeChatId).toBe("c1");
  });

  it("при удалении неактивного чата activeChatId не меняется", () => {
    const chat1 = makeChat("c1");
    const chat2 = makeChat("c2");
    let state = stateWithChat(chat1);
    state = chatReducer(state, { type: "CREATE_CHAT", payload: chat2 });
    state = chatReducer(state, { type: "SET_ACTIVE_CHAT", payload: "c1" });

    const next = chatReducer(state, { type: "DELETE_CHAT", payload: "c2" });

    expect(next.activeChatId).toBe("c1");
  });

  it("сообщения удалённого чата очищаются из messagesByChat", () => {
    const chat = makeChat("c1");
    let state = stateWithChat(chat);
    state = chatReducer(state, {
      type: "ADD_MESSAGE",
      payload: { chatId: "c1", message: makeMessage("m1") },
    });

    const next = chatReducer(state, { type: "DELETE_CHAT", payload: "c1" });

    expect(next.messagesByChat["c1"]).toBeUndefined();
  });
});

// ── RENAME_CHAT ────────────────────────────────────────────────────────────────

describe("RENAME_CHAT", () => {
  it("название чата корректно обновляется по id", () => {
    const chat = makeChat("c1", "Old Title");
    const state = stateWithChat(chat);

    const next = chatReducer(state, {
      type: "RENAME_CHAT",
      payload: { id: "c1", title: "New Title" },
    });

    expect(next.chats.find((c) => c.id === "c1")?.title).toBe("New Title");
  });

  it("переименование не затрагивает другие чаты", () => {
    const chat1 = makeChat("c1", "Chat One");
    const chat2 = makeChat("c2", "Chat Two");
    let state = stateWithChat(chat1);
    state = chatReducer(state, { type: "CREATE_CHAT", payload: chat2 });

    const next = chatReducer(state, {
      type: "RENAME_CHAT",
      payload: { id: "c1", title: "Renamed" },
    });

    expect(next.chats.find((c) => c.id === "c2")?.title).toBe("Chat Two");
  });

  it("переименование несуществующего id не изменяет список", () => {
    const chat = makeChat("c1", "Chat One");
    const state = stateWithChat(chat);

    const next = chatReducer(state, {
      type: "RENAME_CHAT",
      payload: { id: "unknown", title: "Ghost" },
    });

    expect(next.chats).toEqual(state.chats);
  });
});
