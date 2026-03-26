import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Message } from "../types";
import {
  useChatState,
  useChatDispatch,
} from "../app/providers/ChatProvider";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export type UseChatOptions = {
  chatId: string;
  api?: string;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
};

export function useChat(options: UseChatOptions) {
  const { messagesByChat, isLoading, error } = useChatState();
  const dispatch = useChatDispatch();

  const messages = messagesByChat[options.chatId] ?? [];

  const [input, setInput] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const handleStream = async (
    response: Response,
    assistantMessage: Message
  ) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error("No reader available");

    dispatch({
      type: "ADD_MESSAGE",
      payload: { chatId: options.chatId, message: assistantMessage },
    });

    let done = false;
    let accumulated = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";

              if (content) {
                accumulated += content;
                dispatch({
                  type: "UPDATE_MESSAGE",
                  payload: {
                    chatId: options.chatId,
                    messageId: assistantMessage.id,
                    content: accumulated,
                  },
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    }

    options.onFinish?.(assistantMessage);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
    };

    dispatch({
      type: "ADD_MESSAGE",
      payload: { chatId: options.chatId, message: userMessage },
    });

    if (messages.length === 0 && content.trim().length >= 3) {
      const trimmed = content.trim();
      const title =
        trimmed.length > 40 ? trimmed.slice(0, 40).trimEnd() + "…" : trimmed;
      dispatch({
        type: "RENAME_CHAT",
        payload: { id: options.chatId, title },
      });
    }

    setInput("");
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(options.api || "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      await handleStream(response, assistantMessage);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const e = err as Error;
      dispatch({ type: "SET_ERROR", payload: e.message });
      options.onError?.(e);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    await sendMessage(input);
  };

  const stop = () => {
    abortControllerRef.current?.abort();
    dispatch({ type: "SET_LOADING", payload: false });
  };

  const reload = () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  };

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    sendMessage,
    isLoading,
    error,
    stop,
    reload,
  };
}
