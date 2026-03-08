import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    port: 3000,
    proxy: {
      '/api/user':    { target: 'http://localhost:8090', changeOrigin: true, rewrite: p => p.replace(/^\/api\/user/, '') },
      '/api/route':   { target: 'http://localhost:8082', changeOrigin: true, rewrite: p => p.replace(/^\/api\/route/, '') },
      '/api/booking': { target: 'http://localhost:8083', changeOrigin: true, rewrite: p => p.replace(/^\/api\/booking/, '') },
    }
  }
})
