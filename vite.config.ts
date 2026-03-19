import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

const MOCK_PHRASES = [
  'Привет! Я мок-сервер GigaChat. ',
  'Это потоковый ответ — ',
  'каждый фрагмент приходит ',
  'с небольшой задержкой, ',
  'как в настоящем SSE. ',
  'Всё работает корректно! 🎉',
]

function mockChatHandler(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (req.url !== '/api/chat' || req.method !== 'POST') return next()

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  let i = 0
  const interval = setInterval(() => {
    if (i >= MOCK_PHRASES.length) {
      res.write('data: [DONE]\n\n')
      clearInterval(interval)
      res.end()
      return
    }
    const chunk = JSON.stringify({ choices: [{ delta: { content: MOCK_PHRASES[i++] } }] })
    res.write(`data: ${chunk}\n\n`)
  }, 150)

  req.on('close', () => clearInterval(interval))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-chat-api',
      configureServer(server) {
        server.middlewares.use(mockChatHandler)
      },
    },
  ],
  base: '/mipt-gigachat-ui/',
})
