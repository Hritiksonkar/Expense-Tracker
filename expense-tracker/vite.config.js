import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            ui: ['@mui/material', '@mui/x-charts']
          }
        },
        onwarn(warning, warn) {
          // Suppress certain warnings that are not critical
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'SOURCEMAP_ERROR') return;
          warn(warning);
        }
      },
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      host: true,
      strictPort: false,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://expense-tracker-i7fh.onrender.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1')
        }
      }
    },
    preview: {
      port: 4173,
      host: true,
      strictPort: false
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_NODE_ENV': JSON.stringify(env.VITE_NODE_ENV || mode),
      global: 'globalThis',
      __DEV__: mode === 'development'
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'axios', 'chart.js', 'react-chartjs-2']
    },
    envPrefix: 'VITE_',
    envDir: process.cwd()
  }
})
