/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Isso garante que o Tailwind analise seus arquivos React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


