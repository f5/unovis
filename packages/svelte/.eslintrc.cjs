// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolve } = require('node:path')

module.exports = {
  ignorePatterns: [
    'dist/*',
    'dist-demo/*',
    'src-demo/svelte-gallery.svelte',
  ],
  overrides: [{
    files: ['autogen/**/*.ts'],
    settings: {
      'import/resolver': {
        typescript: {
          project: [resolve(__dirname, 'autogen/tsconfig.json')],
        },
      },
    },
  }, {
    files: ['src/**/*.svelte', 'src/*.svelte', 'src-demo/*.svelte', 'test/**/*.svelte'],
    extends: [
      'plugin:svelte/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    parser: 'svelte-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      project: ['./tsconfig.json', './autogen/tsconfig.json', './test/tsconfig.json'],
      extraFileExtensions: ['.svelte'],
      tsconfigRootDir: __dirname,
    },
    rules: {
      'svelte/indent': ['error'],
      'no-use-before-define': 'off',
      'no-undef-init': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  ],
}


