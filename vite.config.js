import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adicione esta linha para garantir que o Vite sirva a partir da raiz
  base: '/',
});
