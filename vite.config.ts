import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'docs/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  base: '/mipt-gigachat-ui/',
  server: {
    proxy: {
      '/auth/api': {
        target: 'https://ngw.devices.sberbank.ru:9443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth\/api/, '/api'),
      },
      '/api': {
        target: 'https://gigachat.devices.sberbank.ru',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Markdown rendering (react-markdown + remark/rehype plugins)
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark') ||
            id.includes('node_modules/rehype') ||
            id.includes('node_modules/unified') ||
            id.includes('node_modules/mdast') ||
            id.includes('node_modules/hast') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/vfile') ||
            id.includes('node_modules/unist')
          ) {
            return 'vendor-markdown'
          }
          // Syntax highlighting (Prism.js via react-syntax-highlighter)
          if (id.includes('node_modules/react-syntax-highlighter') || id.includes('node_modules/prismjs')) {
            return 'vendor-syntax-highlighter'
          }
          // KaTeX (LaTeX rendering)
          if (id.includes('node_modules/katex') || id.includes('node_modules/rehype-katex') || id.includes('node_modules/remark-math')) {
            return 'vendor-katex'
          }
        },
      },
    },
  },
})
