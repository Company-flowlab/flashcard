import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/',
  build: {
    rollupOptions: {
      // Remove esta configuração ou ajuste para o caminho correto
      // O Vite automaticamente usa o index.html da raiz
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});
