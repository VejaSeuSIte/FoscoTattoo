/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        noite: '#0b0806',
        carvao: '#14100c',
        fuligem: '#1c1611',
        couro: '#261c15',
        tijolo: { 900: '#22150d', 800: '#2e1c11', 700: '#3c2516', 600: '#55331d', 500: '#6e4424' },
        ambar: { DEFAULT: '#d4914a', claro: '#ecbd7c', escuro: '#a86a2c' },
        osso: { DEFAULT: '#ebdfc7', 2: '#cdbd9b', 3: '#a59479', 4: '#7d705c' },
        papel: { DEFAULT: '#e9dcc0', 2: '#ddcdab', tinta: '#261a14' },
        selo: { DEFAULT: '#b5402e', escuro: '#8e2d20' },
        vinho: { DEFAULT: '#3a1a1c', escuro: '#24100f' },
        decalque: { DEFAULT: '#f1eef8', tinta: '#5b3fa8' },
        bambu: '#7c8a4c',
        latao: '#b08d57',
      },
      fontFamily: {
        gotica: ['var(--fonte-gotica)', 'serif'],
        corpo: ['var(--fonte-corpo)', 'system-ui', 'sans-serif'],
        mono: ['var(--fonte-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        quadro: '0 18px 40px -12px rgba(0,0,0,.85), 0 4px 10px rgba(0,0,0,.6)',
        brilho: '0 0 60px -10px rgba(236,170,90,.45)',
      },
    },
  },
  plugins: [],
};
