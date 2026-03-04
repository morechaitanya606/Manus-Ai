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
        // Keep existing radix UI compatible vars mapped to new void theme
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        primary: 'hsl(var(--primary))',  // mapped to cyan
        accent: 'hsl(var(--accent))',    // mapped to magenta
        border: 'hsl(var(--border))',

        // Future Fab Lab specific palette
        "void": "#0A0A0C",
        "panel": "#16161A",
        "panel-highlight": "#24242C",
        "cyan": "#00F0FF",
        "magenta": "#D32DFF",
        "purple": "#7000FF",
        "text-main": "#EEEEF0",
        "text-dim": "#A1A1AA",
        "border-std": "#33333E",
      },
      borderRadius: {
        lg: '0.9rem',
        md: '0.65rem',
        sm: '0.45rem'
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #33333E 1px, transparent 1px), linear-gradient(to bottom, #33333E 1px, transparent 1px)",
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 2s infinite',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scan: {
          '0%': { top: '0%', opacity: 0 },
          '10%': { opacity: 0.8 },
          '90%': { opacity: 0.8 },
          '100%': { top: '100%', opacity: 0 },
        }
      }
    }
  },
  plugins: []
};
