/** @type {import('tailwindcss').Config} */
import { colors, fontFamily, fontSize, screens } from './src/theme/tokens';

/**
 * typo-* 유틸리티에 등록할 토큰 매핑
 * [mobile token key, tablet token key | null]
 */
const typoTokenMap = [
  ['display-1-bold', 'display-1-bold-tablet'],
  ['display-1-semibold', 'display-1-semibold-tablet'],
  ['title-1-bold', 'title-1-bold-tablet'],
  ['title-1-semibold', 'title-1-semibold-tablet'],
  ['title-2-bold', 'title-2-bold-tablet'],
  ['title-2-semibold', 'title-2-semibold-tablet'],
  ['heading-1-bold', 'heading-1-bold-tablet'],
  ['heading-1-semibold', 'heading-1-semibold-tablet'],
  ['heading-2-bold', 'heading-2-bold-tablet'],
  ['heading-2-semibold', 'heading-2-semibold-tablet'],
  ['body-1-medium', 'body-1-medium-tablet'],
  ['body-1-regular', 'body-1-regular-tablet'],
  ['body-2-medium', null],
  ['body-2-regular', null],
  ['label-semibold', null],
  ['label-medium', null],
  ['caption-medium', null],
  ['caption-regular', null],
];

function buildTypoUtilities() {
  const utilities = {};

  for (const [mobileKey, tabletKey] of typoTokenMap) {
    const [mobileSize, mobileAttrs] = fontSize[mobileKey];
    const base = { fontSize: mobileSize, ...mobileAttrs };

    if (tabletKey) {
      const [tabletSize, tabletAttrs] = fontSize[tabletKey];
      base['@media (min-width: 740px)'] = { fontSize: tabletSize, ...tabletAttrs };
    }

    utilities[`.typo-${mobileKey}`] = base;
  }

  return utilities;
}

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
  plugins: [
    function ({ addUtilities }) {
      addUtilities(buildTypoUtilities());
    },
  ],
};
