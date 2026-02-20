/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        primary: 'hsl(var(--primary))',
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))'
      },
      borderRadius: {
        lg: '0.9rem',
        md: '0.65rem',
        sm: '0.45rem'
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
};
