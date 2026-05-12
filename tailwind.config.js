/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['"Caveat Brush"', '"Pacifico"', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: '#f5f1e8',
        paperDark: '#0f1420',
        ink: '#1a1a1a',
        inkDark: '#e8e8e8',
        muted: '#8a8a8a',
      },
    },
  },
  plugins: [],
};
