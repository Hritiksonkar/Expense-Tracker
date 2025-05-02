import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2', '@mui/x-charts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
