import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importa o módulo 'path' para resolver caminhos

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/',
  build: {
    rollupOptions: {
      input: {
        // Define explicitamente o index.html como o ponto de entrada principal para o build
        // Usa path.resolve para garantir que o caminho seja absoluto e correto
        main: path.resolve(__dirname, 'public', 'index.html'),
      },
    },
  },
});
