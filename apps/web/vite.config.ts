import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { FontaineTransform } from 'fontaine'

const options = {
  fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans'],
  resolvePath: (id: string) => `file:///public/${id}`,
}

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), FontaineTransform.vite(options)],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
