import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import typographyPlugin from './apps/native/eslint-plugin-typography.js';

/** @type {import("eslint").FlatConfig[]} */
export default [
  {
    ignores: ['node_modules', 'dist', 'build', 'apps/native/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...prettierConfig.rules,

      'prettier/prettier': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 사용하지 않는 변수 경고
    },
    settings: {
      react: {
        version: 'detect', // React 버전 자동 감지
      },
    },
  },
  {
    files: ['apps/native/**/*.{jsx,tsx}'],
    plugins: {
      typography: typographyPlugin,
    },
    rules: {
      'typography/no-deprecated-font-token': 'warn',
      'typography/no-direct-typography-token': 'error',
    },
  },
];
