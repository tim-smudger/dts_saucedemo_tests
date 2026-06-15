const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: [
      "node_modules",
      "playwright-report",
      "test-results",
      ".features-gen",
      "eslint.config.js",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "error",
      "no-empty-pattern": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "writable",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
