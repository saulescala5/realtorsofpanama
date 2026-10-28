/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // brass gold: 500 for fills/lines, 700 for text on white (AA contrast)
        brand: {
          50: '#F8F4EA', 100: '#F0E7D2', 200: '#E2D0A6', 300: '#D1B77D', 400: '#C2A25E',
          500: '#B08D45', 600: '#957536', 700: '#7A6029', 800: '#5E4920', 900: '#3F3116',
        },
        ink: { DEFAULT: '#000000', soft: '#5B5A57', mute: '#8F8D88' },
        mint: { 400: '#3DDC97', 500: '#1FAF68', 600: '#178A52' },
        sun: { 400: '#E2D0A6', 500: '#C2A25E' },
        line: '#E4E2DD',
        canvas: '#F3F2EF',
        night: { DEFAULT: '#000000', 800: '#141413', 700: '#22211F', line: '#2E2D2A' },
      },
      fontFamily: {
        sans: ['Jost', 'system-ui', 'sans-serif'],
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.04)',
        lift: '0 18px 40px -20px rgba(0,0,0,.35)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { rise: 'rise .45s ease-out both' },
    },
  },
  plugins: [],
}
