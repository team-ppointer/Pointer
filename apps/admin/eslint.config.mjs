import baseConfig from '../../eslint.config.mjs';
import pluginQuery from '@tanstack/eslint-plugin-query';

/** @type {import("eslint").FlatConfig[]} */
export default [
  ...baseConfig,
  {
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: {
      ...pluginQuery.configs.recommended.rules,
    },
  },
];
