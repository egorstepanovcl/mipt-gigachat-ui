import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Message, Settings } from "../types";
import {
  useChatState,
  useChatDispatch,
} from "../app/providers/ChatProvider";
import {
  sendChatRequest,
  type ApiMessage,
  type ChatRequestOptions,
} from "../api/gigachat";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export type UseChatOptions = {
  chatId: string;
  settings: Settings;
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

  const buildApiMessages = (msgs: Message[]): ApiMessage[] => {
    const apiMessages: ApiMessage[] = [];

    if (options.settings.systemPrompt.trim()) {
      apiMessages.push({
        role: "system",
        content: options.settings.systemPrompt.trim(),
      });
    }

    for (const m of msgs) {
      if (m.role === "user" || m.role === "assistant") {
        apiMessages.push({ role: m.role, content: m.content });
      }
    }

    return apiMessages;
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
    let buffer = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

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

  const handleNonStreamResponse = async (
    response: Response,
    assistantMessage: Message
  ) => {
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    assistantMessage.content = content;
    dispatch({
      type: "ADD_MESSAGE",
      payload: { chatId: options.chatId, message: assistantMessage },
    });

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

    const apiMessages = buildApiMessages([...messages, userMessage]);
    const requestOptions: ChatRequestOptions = {
      model: options.settings.model,
      temperature: options.settings.temperature,
      topP: options.settings.topP,
      maxTokens: options.settings.maxTokens,
      stream: true,
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    try {
      const response = await sendChatRequest(
        apiMessages,
        requestOptions,
        abortControllerRef.current.signal
      );

      await handleStream(response, assistantMessage);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;

      // Fallback: попробовать без стриминга
      try {
        const fallbackResponse = await sendChatRequest(
          apiMessages,
          { ...requestOptions, stream: false },
          abortControllerRef.current.signal
        );

        await handleNonStreamResponse(fallbackResponse, assistantMessage);
      } catch (fallbackErr) {
        if ((fallbackErr as Error).name === "AbortError") return;
        const e = fallbackErr as Error;
        dispatch({ type: "SET_ERROR", payload: e.message });
        options.onError?.(e);
      }
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
