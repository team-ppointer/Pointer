import baseConfig from '../../eslint.config.mjs';
import expoConfig from 'eslint-config-expo/flat';

/** @type {import('eslint').FlatConfig[]} */
export default [
  ...baseConfig,
  ...expoConfig,
  {
    ignores: ['dist/*'],
  },
];
