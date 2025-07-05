import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importa o módulo 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/',
  // Configurações de build
  build: {
    rollupOptions: {
      input: {
        // Define o index.html dentro da pasta 'public' como o ponto de entrada principal para o build
        main: path.resolve(__dirname, 'public', 'index.html'), // <-- Caminho corrigido aqui
      },
    },
  },
});
