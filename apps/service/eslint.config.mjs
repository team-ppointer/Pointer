import baseConfig from '../../eslint.config.mjs';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import("eslint").FlatConfig[]} */
export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react/jsx-props-no-spreading': 'off', // Next.js에서 Prop Spreading 허용
    },
  },
];
