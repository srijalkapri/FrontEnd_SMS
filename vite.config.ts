import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      // Visual Studio locks files under .vs; watching them crashes Vite with EBUSY.
      ignored: ['**/.vs/**', '**/node_modules/**'],
    },
    proxy: {
      '/api': {
        target: 'https://localhost:7172',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
