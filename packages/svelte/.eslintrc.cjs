module.exports = {
  "ignorePatterns": [
    "dist/*",
  ],
  "overrides": [{
      "files": ["src/**/*.svelte"],
      "extends": [
        "plugin:svelte/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      "parser": "svelte-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser",
        "project": ["./tsconfig.json", "./autogen/tsconfig.json"],
        "extraFileExtensions": [".svelte"],
        "tsconfigRootDir": __dirname,
      },
      "rules": {
        "svelte/indent": ["error"],
        "no-use-before-define": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      }
    }
  ]
}


