/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050A10', // Deepest background
          900: '#0D1B2A', // Main dashboard bg
          800: '#101826', // Card bg
          700: '#1B263B', // Lighter panels
          600: '#2C3E50', // Borders/Separators
        },
        neon: {
          blue: '#00F0FF',
          violet: '#7B2CBF',
          cyan: '#4CC9F0',
          green: '#00FF9D',
          alert: '#FF3838',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'], // Assuming we might want a display font
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5)',
        'neon-violet': '0 0 10px rgba(123, 44, 191, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
