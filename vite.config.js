import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importa o módulo 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a base para o deploy (GitHub Pages)
  base: '/',
  // Define explicitamente o diretório raiz do projeto (onde o Vite deve procurar)
  root: process.cwd(), // Define a raiz como o diretório de trabalho atual
  // Define explicitamente o diretório de arquivos estáticos (onde o index.html está)
  publicDir: 'public',
});

