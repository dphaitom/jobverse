/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Nike-inspired font system
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Helvetica Neue', 'Arial', 'sans-serif'], // Nike uses Futura, similar to Helvetica
        mono: ['JetBrains Mono', 'monospace'],
      },
      // Nike-inspired color palette (black-focused)
      colors: {
        nike: {
          black: '#111111',
          'black-light': '#1a1a1a',
          'black-lighter': '#2d2d2d',
          white: '#ffffff',
          'white-dark': '#f5f5f5',
          orange: '#fa5400', // Nike orange accent
          gray: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        },
        ai: {
          purple: '#8b5cf6',
          'purple-light': '#a78bfa',
          'purple-dark': '#6d28d9',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      // Nike-inspired spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Nike-inspired animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      // Nike-inspired typography
      fontSize: {
        'display-xl': ['5.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-lg': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '900' }],
        'display-md': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }],
      },
      // Box shadows
      boxShadow: {
        'nike': '0 10px 30px rgba(0, 0, 0, 0.15)',
        'nike-lg': '0 20px 60px rgba(0, 0, 0, 0.2)',
        'nike-hover': '0 15px 40px rgba(0, 0, 0, 0.25)',
        'glow-purple': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-orange': '0 0 40px rgba(250, 84, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
