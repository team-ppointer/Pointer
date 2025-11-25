/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
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
