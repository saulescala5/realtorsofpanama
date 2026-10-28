/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // gold accent, used sparingly: 400 fills, 700 text on light backgrounds
        brand: {
          50: '#FBF6E8', 100: '#F6ECCD', 200: '#EEDCA2', 300: '#E9D08A', 400: '#E3C46E', 500: '#D4AE4C', 600: '#B38F33', 700: '#8A6D22', 800: '#664F18', 900: '#3F3110',
        },
        ink: { DEFAULT: '#000000', soft: '#5E5E5A', mute: '#9A9A95' },
        mint: { 400: '#3DDC97', 500: '#1FAF68', 600: '#178A52' },
        sun: { 400: '#EEDCA2', 500: '#E3C46E' },
        line: '#E3E3DF',
        canvas: '#F4F4F2',
        paper: '#F4F4F2',
        night: { DEFAULT: '#000000', 800: '#111110', 700: '#1C1C1A', line: '#2A2A28' },
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.04)',
        lift: '0 30px 60px -30px rgba(0,0,0,.35)',
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.25rem' },
      keyframes: {
        rise: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { rise: 'rise .45s ease-out both' },
    },
  },
  plugins: [],
}
