module.exports = {
  ignorePatterns: ["dist/*"],
  overrides: [
    {
      files: ["src/**/*.vue"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "@antfu",
      ],
      parserOptions: {
        parser: "@typescript-eslint/parser",
        project: ["./tsconfig.json", "./autogen/tsconfig.json"],
        extraFileExtensions: [".vue"],
        tsconfigRootDir: __dirname,
      },
      rules: {
        "vue/indent": ["error"],
        "import/first": "off",
        "no-use-before-define": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
  ],
};
