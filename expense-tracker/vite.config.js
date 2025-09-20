import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
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
        }
      },
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      host: true
    },
    preview: {
      port: 4173,
      host: true
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'axios', 'chart.js', 'react-chartjs-2']
    }
  }
})
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
