import { useState, useRef, useCallback, useEffect } from "react";

export type UseStreamingResponseOptions = {
  url: string;
  enabled?: boolean;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  parseChunk?: (rawChunk: Uint8Array) => string;
};

type Metadata = {
  startTime: number | null;
  endTime: number | null;
  responseTime: string;
  chunkCount: number;
};

const INITIAL_METADATA: Metadata = {
  startTime: null,
  endTime: null,
  responseTime: "",
  chunkCount: 0,
};

export function useStreamingResponse(options: UseStreamingResponseOptions) {
  const [data, setData] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamedChunks, setStreamedChunks] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata>(INITIAL_METADATA);

  const abortControllerRef = useRef<AbortController | null>(null);
  const decoderRef = useRef(new TextDecoder());

  const processStream = async (body: ReadableStream, startTime: number) => {
    const reader = body.getReader();
    let accumulatedText = "";
    let chunkIndex = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          const endTime = Date.now();
          setMetadata((prev) => ({
            ...prev,
            endTime,
            responseTime: `${endTime - startTime}ms`,
          }));
          options.onComplete?.(accumulatedText);
          break;
        }

        const chunkText = options.parseChunk
          ? options.parseChunk(value)
          : decoderRef.current.decode(value, { stream: true });

        accumulatedText += chunkText;
        chunkIndex++;

        setData(accumulatedText);
        setStreamedChunks((prev) => [...prev, chunkText]);
        setMetadata((prev) => ({ ...prev, chunkCount: chunkIndex }));

        options.onChunk?.(chunkText);
      }
    } finally {
      reader.releaseLock();
    }
  };

  const startStream = async () => {
    setIsStreaming(true);
    setError(null);
    setData("");
    setStreamedChunks([]);

    const startTime = Date.now();
    setMetadata({ ...INITIAL_METADATA, startTime });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(options.url, {
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      await processStream(response.body, startTime);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        console.log("Stream aborted by user");
      } else {
        const e = err as Error;
        setError(e);
        options.onError?.(e);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const startSSEStream = () => {
    setIsStreaming(true);
    setError(null);
    setData("");
    setStreamedChunks([]);

    const startTime = Date.now();
    setMetadata({ ...INITIAL_METADATA, startTime });

    const eventSource = new EventSource(options.url);
    let accumulatedText = "";
    let chunkIndex = 0;

    eventSource.onmessage = (event) => {
      const chunkText: string = event.data;

      if (chunkText === "[DONE]") {
        eventSource.close();
        setIsStreaming(false);
        const endTime = Date.now();
        setMetadata((prev) => ({
          ...prev,
          endTime,
          responseTime: `${endTime - startTime}ms`,
        }));
        options.onComplete?.(accumulatedText);
        return;
      }

      let content = chunkText;
      try {
        const parsed = JSON.parse(chunkText);
        content = parsed.choices?.[0]?.delta?.content || "";
      } catch {
        // не JSON — используем как есть
      }

      if (content) {
        accumulatedText += content;
        chunkIndex++;
        setData(accumulatedText);
        setStreamedChunks((prev) => [...prev, content]);
        setMetadata((prev) => ({ ...prev, chunkCount: chunkIndex }));
        options.onChunk?.(content);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsStreaming(false);
      const e = new Error("SSE connection error");
      setError(e);
      options.onError?.(e);
    };

    abortControllerRef.current = {
      abort: () => eventSource.close(),
    } as AbortController;
  };

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setData("");
    setStreamedChunks([]);
    setError(null);
    setMetadata(INITIAL_METADATA);
  }, []);

  useEffect(() => {
    if (options.enabled) {
      startStream();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [options.enabled, options.url]);

  return {
    data,
    isStreaming,
    error,
    streamedChunks,
    metadata,
    abort,
    reset,
    startStream,
    startSSEStream,
  };
}
