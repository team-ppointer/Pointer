/** @type {import('tailwindcss').Config} */
import { newColors, fontFamily, fontSize, screens } from './src/theme/tokens';

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: newColors,
      fontFamily,
      fontSize,
      screens,
    },
  },
  plugins: [],
};
