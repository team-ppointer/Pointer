import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Black & White
        black: '#000000',
        white: '#FFFFFF',

        // Gray Scale
        lightgray500: '#C8CAD4',
        lightgray400: '#DFE2E7',
        lightgray300: '#EDEEF2',
        lightgray200: '#F3F5F8',
        lightgray100: '#F8F9FC',

        midgray200: '#B6B7B7',
        midgray100: '#9FA4AE',

        darkgray200: '#222324',
        darkgray100: '#3E3F45',

        background: '#F7F7F7',

        // Colors
        green: '#0F7B0D',
        red: '#D20000',
        lightred: '#FCE4E4',
        blue: '#5A67EE',
        lightblue: '#ECF0FB',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
} satisfies Config;
