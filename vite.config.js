import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/',
  // Remove a configuração explícita de input para permitir que o Vite detecte automaticamente
  // o index.html na pasta public e o ponto de entrada src/main.jsx
});
