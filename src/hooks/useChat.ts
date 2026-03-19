import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Message } from "../types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export type UseChatOptions = {
  api?: string;
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
};

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(
    options.initialMessages || []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

    setMessages((prev) => [...prev, assistantMessage]);

    let done = false;

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
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = { ...updated[updated.length - 1] };
                  lastMsg.content += content;
                  updated[updated.length - 1] = lastMsg;
                  return updated;
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

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
      setError(e);
      options.onError?.(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    await sendMessage(input);
  };

  const stop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const reload = () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === lastUserMessage.id);
        return idx === -1 ? prev : prev.slice(0, idx);
      });
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
    setMessages,
  };
}
