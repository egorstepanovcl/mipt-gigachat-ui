# Задача 1

Реализуйте кастомный хук `useChat` для управления чат-интерфейсом,
поддерживающим отправку сообщений, потоковые ответы и управление состоянием.

## Требования к API хука

### Возвращаемый интерфейс

```ts
const {
  messages,          // Message[] — массив всех сообщений
  input,             // string — текущее значение в поле ввода
  handleInputChange, // (e: ChangeEvent) => void
  handleSubmit,      // (e: FormEvent) => void
  isLoading,         // boolean — идёт ли запрос
  error,             // Error | null
  stop,              // () => void — остановить генерацию
  reload,            // () => void — повторить последний запрос
  setMessages,       // (messages: Message[]) => void
} = useChat(options);
```

### Тип сообщения

```ts
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
};
```

### Опции хука

```ts
type UseChatOptions = {
  api?: string;                          // URL эндпоинта (по умолчанию '/api/chat')
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
};
```

## Задача 1.1. Базовое управление состоянием

Реализуйте управление состоянием с помощью `useState`:

- массив сообщений `messages`
- текущий ввод пользователя `input`
- флаг загрузки `isLoading`
- объект ошибки `error`

```ts
const [messages, setMessages] = useState<Message[]>(
  options.initialMessages || []
);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
```

## Задача 1.2. Обработка ввода

Реализуйте функцию `handleInputChange`:

```ts
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setInput(e.target.value);
};
```

## Задача 1.3. Отправка сообщения и потоковая обработка

Реализуйте `handleSubmit`, который:

- добавляет сообщение пользователя в массив
- отправляет POST-запрос на API
- обрабатывает потоковый ответ (ReadableStream)
- инкрементально обновляет сообщение ассистента

```ts
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!input.trim() || isLoading) return;

  const userMessage: Message = {
    id: generateId(),
    role: 'user',
    content: input,
    createdAt: new Date(),
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(options.api || '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Обработка потока
    await handleStream(response);

  } catch (err) {
    const error = err as Error;
    setError(error);
    options.onError?.(error);
  } finally {
    setIsLoading(false);
  }
};
```

## Задача 1.4. Обработка потокового ответа

Реализуйте функцию `handleStream` для чтения `ReadableStream`:

```ts
const handleStream = async (response: Response) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No reader available');

  const assistantMessage: Message = {
    id: generateId(),
    role: 'assistant',
    content: '',
    createdAt: new Date(),
  };

  setMessages(prev => [...prev, assistantMessage]);

  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const chunk = decoder.decode(value);
      // Парсим SSE-формат: "data: {...}\n\n"
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.?.delta?.content || '';

            // Обновляем последнее сообщение
            setMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              lastMsg.content += content;
              return updated;
            });
          } catch (e) {
            // Игнорируем ошибки парсинга
          }
        }
      }
    }
  }

  options.onFinish?.(assistantMessage);
};
```

## Задача 1.5. Дополнительные функции

### Остановка генерации

```ts
const abortControllerRef = useRef<AbortController | null>(null);

const stop = () => {
  abortControllerRef.current?.abort();
  setIsLoading(false);
};

// В handleSubmit добавить:
abortControllerRef.current = new AbortController();
const response = await fetch(api, {
  signal: abortControllerRef.current.signal,
  // ...
});
```

## Дополнительное задание*

- Добавьте поддержку вложений: файлов, изображений
- Реализуйте персистентность через `localStorage`
- Добавьте оптимистичные обновления UI
- Поддержите множественные параллельные запросы — ветвление диалога

# Задача 2

Реализуйте кастомный хук `useStreamingResponse` для обработки потоковых
ответов от сервера с поддержкой ReadableStream и server-sent events.

## Требования к API хука

### Возвращаемый интерфейс

```ts
const {
  data,             // string — накопленные данные из стрима (потока)
  isStreaming,      // boolean — идёт ли поток
  error,            // Error | null
  streamedChunks,   // string[] — массив всех полученных чанков
  metadata,         // { startTime, endTime, responseTime, chunkCount }
  abort,            // () => void — прервать стрим
  reset,            // () => void — очистить данные
} = useStreamingResponse(options);
```

### Опции хука

```ts
type UseStreamingResponseOptions = {
  url: string;
  enabled?: boolean;                          // Начать стрим автоматически
  method?: 'GET' | 'POST';
  body?: any;
  headers?: Record<string, string>;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  parseChunk?: (rawChunk: Uint8Array) => string; // Кастомный парсер
};
```

## Задача 2.1. Базовое управление состоянием

Реализуйте состояние для управления стримом:

```ts
const [data, setData] = useState<string>('');
const [isStreaming, setIsStreaming] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [streamedChunks, setStreamedChunks] = useState<string[]>([]);
const [metadata, setMetadata] = useState({
  startTime: null as number | null,
  endTime: null as number | null,
  responseTime: '',
  chunkCount: 0,
});

const abortControllerRef = useRef<AbortController | null>(null);
const decoderRef = useRef(new TextDecoder());
```

## Задача 2.2. Инициация стрима с ReadableStream

Реализуйте основную функцию для запуска стрима:

```ts
const startStream = async () => {
  setIsStreaming(true);
  setError(null);
  setData('');
  setStreamedChunks([]);

  const startTime = Date.now();
  setMetadata(prev => ({ ...prev, startTime, chunkCount: 0 }));

  // Создаём новый AbortController для отмены
  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch(options.url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body available');
    }

    // Обработка ReadableStream
    await processStream(response.body, startTime);

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted by user');
    } else {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    }
  } finally {
    setIsStreaming(false);
  }
};
```

## Задача 2.3. Обработка ReadableStream

Реализуйте функцию чтения потока данных:

```ts
const processStream = async (body: ReadableStream, startTime: number) => {
  const reader = body.getReader();
  let accumulatedText = '';
  let chunkIndex = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        const endTime = Date.now();
        const responseTime = `${endTime - startTime}ms`;

        setMetadata(prev => ({
          ...prev,
          endTime,
          responseTime,
        }));

        options.onComplete?.(accumulatedText);
        break;
      }

      // Декодируем чанк
      const chunkText = options.parseChunk
        ? options.parseChunk(value)
        : decoderRef.current.decode(value, { stream: true });

      // Обновляем данные
      accumulatedText += chunkText;
      chunkIndex++;

      setData(accumulatedText);
      setStreamedChunks(prev => [...prev, chunkText]);
      setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));

      options.onChunk?.(chunkText);
    }
  } finally {
    reader.releaseLock();
  }
};
```

## Задача 2.4. Поддержка server-sent events (SSE)

Добавьте альтернативную реализацию для SSE:

```ts
const startSSEStream = () => {
  setIsStreaming(true);
  setError(null);
  setData('');

  const startTime = Date.now();
  setMetadata(prev => ({ ...prev, startTime, chunkCount: 0 }));

  const eventSource = new EventSource(options.url);
  let accumulatedText = '';
  let chunkIndex = 0;

  eventSource.onmessage = (event) => {
    const chunkText = event.data;

    // Проверка на завершающий сигнал
    if (chunkText === '[DONE]') {
      eventSource.close();
      setIsStreaming(false);

      const endTime = Date.now();
      setMetadata(prev => ({
        ...prev,
        endTime,
        responseTime: `${endTime - startTime}ms`,
      }));

      options.onComplete?.(accumulatedText);
      return;
    }

    try {
      // Парсим JSON, если нужно
      const parsed = JSON.parse(chunkText);
      const content = parsed.choices?.?.delta?.content || '';

      if (content) {
        accumulatedText += content;
        chunkIndex++;

        setData(accumulatedText);
        setStreamedChunks(prev => [...prev, content]);
        setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));

        options.onChunk?.(content);
      }
    } catch (e) {
      // Если не JSON, используем «как есть»
      accumulatedText += chunkText;
      chunkIndex++;

      setData(accumulatedText);
      setStreamedChunks(prev => [...prev, chunkText]);
      setMetadata(prev => ({ ...prev, chunkCount: chunkIndex }));

      options.onChunk?.(chunkText);
    }
  };

  eventSource.onerror = (err) => {
    eventSource.close();
    setIsStreaming(false);

    const error = new Error('SSE connection error');
    setError(error);
    options.onError?.(error);
  };

  // Сохраняем ссылку для возможности закрытия
  abortControllerRef.current = {
    abort: () => eventSource.close(),
  } as any;
};
```

## Задача 2.5. Вспомогательные функции

Реализуйте функции управления стримом:

```ts
const abort = useCallback(() => {
  abortControllerRef.current?.abort();
  setIsStreaming(false);
}, []);

const reset = useCallback(() => {
  setData('');
  setStreamedChunks([]);
  setError(null);
  setMetadata({
    startTime: null,
    endTime: null,
    responseTime: '',
    chunkCount: 0,
  });
}, []);
```

## Задача 2.6. Автоматический запуск и cleanup

Добавьте `useEffect` для управления жизненным циклом:

```ts
useEffect(() => {
  if (options.enabled) {
    startStream();
  }

  // Cleanup при размонтировании
  return () => {
    abortControllerRef.current?.abort();
  };
}, [options.enabled, options.url]);
```

## Финальная структура хука

```ts
export const useStreamingResponse = (options: UseStreamingResponseOptions) => {
  // State
  const [data, setData] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamedChunks, setStreamedChunks] = useState<string[]>([]);
  const [metadata, setMetadata] = useState({...});

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const decoderRef = useRef(new TextDecoder());

  // Functions
  const processStream = async (body: ReadableStream, startTime: number) => {...};
  const startStream = async () => {...};
  const abort = useCallback(() => {...}, []);
  const reset = useCallback(() => {...}, []);

  // Effect
  useEffect(() => {...}, [options.enabled]);

  return {
    data,
    isStreaming,
    error,
    streamedChunks,
    metadata,
    abort,
    reset,
    startStream, // Для ручного запуска
  };
};
```

## Дополнительное задание*

- Добавьте поддержку retry с экспоненциальным backoff при ошибках
- Реализуйте throttling для обновления UI, не чаще N раз в секунду
- Добавьте поддержку нескольких параллельных стримов
- Реализуйте кеширование завершённых стримов в памяти или `localStorage`
