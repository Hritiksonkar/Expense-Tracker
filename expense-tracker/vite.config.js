import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      },
      external: [],
      onwarn(warning, warn) {
        // Suppress certain warnings that are not critical
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'SOURCEMAP_ERROR') return;
        warn(warning);
      }
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://expense-tracker-i7fh.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios', 'chart.js', 'react-chartjs-2']
  }
})
