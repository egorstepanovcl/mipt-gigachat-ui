import type { Message } from "../types";

export const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Привет! Расскажи мне про хуки в React.",
    timestamp: Date.now() - 300000,
  },
  {
    id: "2",
    role: "assistant",
    content: `Привет! Хуки — это функции, которые позволяют использовать состояние и другие возможности React в функциональных компонентах.

**Основные хуки:**

- \`useState\` — локальное состояние компонента
- \`useEffect\` — побочные эффекты (запросы, подписки)
- \`useCallback\` — мемоизация функций
- \`useMemo\` — мемоизация значений

**Пример useState:**

\`\`\`tsx
const [count, setCount] = useState(0);

return (
  <button onClick={() => setCount(count + 1)}>
    Нажато: {count}
  </button>
);
\`\`\`

Хуки можно использовать только внутри функциональных компонентов и только на верхнем уровне — *не внутри условий и циклов*.`,
    timestamp: Date.now() - 290000,
  },
  {
    id: "3",
    role: "user",
    content: "А что такое useEffect? Можешь показать пример с fetch?",
    timestamp: Date.now() - 200000,
  },
  {
    id: "4",
    role: "assistant",
    content: `Конечно! \`useEffect\` запускает код после рендера компонента.

**Пример загрузки данных:**

\`\`\`tsx
useEffect(() => {
  const fetchData = async () => {
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  };

  fetchData();
}, []); // [] — запустить только один раз
\`\`\`

> ⚠️ Не забывай про функцию очистки (cleanup), если подписываешься на события или таймеры.`,
    timestamp: Date.now() - 190000,
  },
  {
    id: "5",
    role: "user",
    content: "Спасибо, всё понятно!",
    timestamp: Date.now() - 100000,
  },
  {
    id: "6",
    role: "assistant",
    content: "Отлично! Если появятся вопросы по React или TypeScript — спрашивай. Удачи с проектом! 🚀",
    timestamp: Date.now() - 90000,
  },
];
