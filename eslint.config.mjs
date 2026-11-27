import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['docs/**', 'node_modules/**', 'public/concepts/vendor/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: globals.browser },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], eqeqeq: 'error', 'prefer-const': 'error', 'no-var': 'error' },
  },
  {
    files: ['*.mjs', 'src/**/*.mjs', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], eqeqeq: 'error', 'prefer-const': 'error' },
  },
];
