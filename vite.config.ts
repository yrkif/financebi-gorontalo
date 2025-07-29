import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// eslint-disable-next-line import/no-unresolved
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/shared/ui'),
      '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@/utils': path.resolve(__dirname, './src/shared/utils'),
      '@/config': path.resolve(__dirname, './src/shared/config'),
      '@/types': path.resolve(__dirname, './src/shared/types'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/store': path.resolve(__dirname, './src/store'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
