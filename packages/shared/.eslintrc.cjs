module.exports = {
  ignorePatterns: [
  ],
  overrides: [{
    files: ['examples/**/*.svelte', '*.svelte'],
    extends: [
      'plugin:svelte/recommended',
    ],
    parser: 'svelte-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      project: ['./tsconfig.json', './tsconfig.svelte.json'],
      extraFileExtensions: ['.svelte'],
      tsconfigRootDir: __dirname,
    },
    rules: {
      'svelte/indent': ['error'],
      'no-use-before-define': 'off',
      'css-unused-selector': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  ],
}
