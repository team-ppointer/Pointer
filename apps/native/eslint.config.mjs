import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import tailwindcss from 'eslint-plugin-tailwindcss';
import typographyPlugin from './eslint-plugin-typography.js';

/** @type {import('eslint').FlatConfig[]} */
export default [
  ...expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier,
      unicorn,
      sonarjs,
      tailwindcss,
    },
    rules: {
      // Prettier
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // Import
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'import/no-duplicates': 'error',
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@/*'],
              message: 'Use specific aliases (@components, @theme, @apis, etc.) instead of @/ catch-all.',
            },
          ],
        },
      ],

      // TypeScript strict
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',

      // React
      'react-hooks/exhaustive-deps': 'warn',

      // Unicorn
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-useless-undefined': 'error',

      // SonarJS
      'sonarjs/cognitive-complexity': ['warn', 15],

      // Tailwind CSS
      'tailwindcss/classnames-order': 'off', // prettier-plugin-tailwindcss handles ordering
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      typography: typographyPlugin,
    },
    rules: {
      'typography/no-deprecated-font-token': 'warn',
      'typography/no-direct-typography-token': 'error',
    },
  },
];
