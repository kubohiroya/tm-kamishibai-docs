import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'output/**', 'tmp/**'],
  },
  {
    files: ['docs/**/*.mjs', 'scripts/**/*.mjs', 'test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      eqeqeq: 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    },
  },
];
