/** @type {import('tailwindcss').Config} */
import { colors, fontFamily, fontSize, screens } from './src/theme/tokens';

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      screens,
    },
  },
  plugins: [],
};
