import expoConfig from 'eslint-config-expo/flat.js';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import tailwindcss from 'eslint-plugin-tailwindcss';
import typographyPlugin from './eslint-plugin-typography.js';

const tsconfigRootDir = new URL('.', import.meta.url).pathname;

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
              message:
                'Use specific aliases (@components, @theme, @apis, etc.) instead of @/ catch-all.',
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
    },
  },
  {
    // Type-aware rules (TS only) — 파서가 프로젝트 타입 정보를 읽도록 projectService 활성화.
    // 비활성 시 @typescript-eslint/no-deprecated 가 hover 레벨에서만 동작하고 lint 에서는 미검지.
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',

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
