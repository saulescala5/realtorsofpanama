/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF6FF', 100: '#D9ECFF', 200: '#B5D9FF', 300: '#80BEFF', 400: '#3D9BFF',
          500: '#0A84FF', 600: '#0570F2', 700: '#065BC7', 800: '#0B4C9C', 900: '#0E3F7D',
        },
        ink: { DEFAULT: '#0B1220', soft: '#475467', mute: '#98A2B3' },
        mint: { 400: '#3DDC97', 500: '#18C47C', 600: '#0FA568' },
        sun: { 400: '#FFC24B', 500: '#FFB020' },
        line: '#E9EEF5',
        canvas: '#F6F8FB',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.08)',
        lift: '0 2px 4px rgba(16,24,40,.04), 0 24px 48px -16px rgba(10,132,255,.25)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        typing: { '0%,80%,100%': { opacity: .25 }, '40%': { opacity: 1 } },
      },
      animation: { rise: 'rise .5s ease-out both', typing: 'typing 1.2s infinite' },
    },
  },
  plugins: [],
}
