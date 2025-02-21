import baseConfig from '../../eslint.config.mjs';

/** @type {import("eslint").FlatConfig[]} */
export default [
  ...baseConfig,
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react/jsx-props-no-spreading': 'off', // Next.js에서 Prop Spreading 허용
    },
  },
];
