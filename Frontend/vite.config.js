import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/captain': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/map': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ride': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/mail': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
