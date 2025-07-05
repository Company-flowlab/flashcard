import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/', // O '/' é crucial para o GitHub Pages
  build: {
    // Define o diretório de saída para os arquivos compilados (padrão é 'dist')
    outDir: 'dist',
    // Define o diretório para os assets (CSS, JS, imagens) dentro de 'outDir'
    assetsDir: 'assets',
    // Garante que o Vite não tente resolver o index.html como um módulo JS
    // Isso é geralmente o padrão, mas explicitamos para evitar o erro
    rollupOptions: {
      // Input não é mais necessário aqui, o Vite lida com isso automaticamente
      // se o index.html estiver em 'public' e main.jsx em 'src'
    },
  },
  // Define o diretório público onde o index.html está
  publicDir: 'public',
});
