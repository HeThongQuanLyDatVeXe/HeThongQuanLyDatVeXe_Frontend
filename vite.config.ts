import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks — these rarely change and get cached by browser
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-axios': ['axios'],
          'vendor-icons': ['@phosphor-icons/react'],
        },
      },
    },
    // Generate smaller chunks
    chunkSizeWarningLimit: 500,
  },
})
