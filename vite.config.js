import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.', // Set root to project root
  build: {
    outDir: 'public/build',
    manifest: true,
    rollupOptions: {
      input: 'resources/js/main.jsx',
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion']
        }
      }
    },
  },
  server: {
    origin: 'http://localhost:5173',
    cors: true,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    },
  },
});
