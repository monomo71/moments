// Wefactly Brutalist Design System implementation for Moments
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        taupe: {
          DEFAULT: '#796e68', // Actief / Hoofdaccent
          hover: '#685c56',
        },
        background: {
          DEFAULT: '#f3f1f1',
          alt: '#eceaea',
          hover: '#faf9f8',
        },
        surface: {
          DEFAULT: '#ffffff',
          hover: '#faf9f8',
        },
        border: {
          DEFAULT: '#e3e1e1',
          dark: '#d3d1d1',
        },
        foreground: {
          DEFAULT: '#000000',
          muted: '#796e68', // text-muted-foreground
          error: '#000000', // Zod Error text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'tiny': '9px',
        'mini': '10px',
      },
      letterSpacing: {
        'widest': '0.15em',
        'ultra': '0.2em',
      },
      borderRadius: {
        // Enforce brutalist sharp corners
        'none': '0',
        'sm': '0',
        DEFAULT: '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0',
      },
      boxShadow: {
        // Enforce no soft shadows
        'none': 'none',
        'sm': 'none',
        DEFAULT: 'none',
        'md': 'none',
        'lg': 'none',
        'xl': 'none',
        '2xl': 'none',
        'inner': 'none',
      }
    },
  },
  plugins: [],
} satisfies Config
