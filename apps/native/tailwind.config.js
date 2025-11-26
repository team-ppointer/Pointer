/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './App.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard'],
        pretendardMedium: ['PretendardMedium'],
        pretendardSemiBold: ['PretendardSemiBold'],
        pretendardBold: ['PretendardBold'],
      },
    },
  },
  plugins: [],
};
