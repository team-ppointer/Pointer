import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { globalIgnores } from 'eslint/config'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Flat config for the pointer-editor-v2 package.
 * - Enforces importing icons ONLY through `../assets` (no direct `/assets/icon`).
 * - Supports TS path aliases via import resolver settings.
 * - Keeps React Hooks / Vite refresh recommended rules.
 *
 * NOTE: For best results with `eslint-plugin-import`, ensure:
 *   - `eslint-plugin-import` is installed
 *   - `eslint-import-resolver-typescript` is installed (for TS path aliases)
 */
export default tseslint.config([
  globalIgnores(['dist']),

  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],

    plugins: {
      import: importPlugin,
    },

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
      },
    },

    rules: {
      /**
       * 1) Ban direct imports from `/assets/icon` and its children.
       *    Force consumers to import from the consolidated barrel: `../assets`.
       *    Also ban importing ui/base except inside src/editor/ui.
       */
      'no-restricted-imports': ['error', {
        paths: [
          { name: '../assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '../../assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '@/editor/assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '@editor/assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
        ],
        patterns: [
          // Disallow any nested path under assets/icon
          '**/assets/icon',
          '**/assets/icon/*',
          // Disallow importing ui/base outside of the ui package
          '**/editor/ui/base',
          '**/editor/ui/base/*',
          // Disallow importing from subpaths under editor/ui (enforce barrel usage)
          '**/editor/ui/*',
          '**/editor/ui/**',
          // Disallow importing from subpaths under editor/utils (enforce barrel usage)
          '**/editor/utils/*',
          '**/editor/utils/**',
          // Disallow importing from subpaths under editor/hooks (enforce barrel usage)
          '**/editor/hooks/*',
          '**/editor/hooks/**',
        ],
      }],

    },
  },

  // Allow ui/base direct imports only within the ui package itself
  {
    files: ['src/editor/ui/**/*.{ts,tsx}'],
    rules: {
      // Re-apply only the assets/icon restriction; allow ui/base internally
      'no-restricted-imports': ['error', {
        paths: [
          { name: '../assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '../../assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '@/editor/assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
          { name: '@editor/assets/icon', message: '아이콘은 ../assets 에서만 임포트하세요.' },
        ],
        patterns: [
          '**/assets/icon',
          '**/assets/icon/*',
        ],
      }],
    },
  },

  // Loosen restrictions for stories/tests if present
  {
    files: ['**/*.stories.*', '**/*.test.*', '**/__tests__/**'],
    rules: {
      'no-restricted-imports': 'off',
      'import/no-internal-modules': 'off',
    },
  },
])
