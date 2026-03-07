import type { Chat } from "../types";

export const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    title: "Как работает React Suspense?",
    messages: [],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "2",
    title: "Напиши мне сортировку пузырьком на TypeScript",
    messages: [],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "3",
    title: "Объясни разницу между var, let и const",
    messages: [],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "4",
    title: "Помоги настроить ESLint и Prettier",
    messages: [],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "5",
    title: "Что такое Feature-Sliced Design?",
    messages: [],
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: "6",
    title: "Архитектура чат-приложения на GigaChat API",
    messages: [],
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 600000,
  },
];
