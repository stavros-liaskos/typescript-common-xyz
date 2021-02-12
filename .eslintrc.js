module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['standard', 'eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-prettier'],
  rules: {
    'no-tabs': ['off'],
    'no-mixed-spaces-and-tabs': ['off'],
    quotes: ['error', 'single'],
    'prettier/prettier': 'error',
  },
};
