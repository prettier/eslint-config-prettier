"use strict";

// This file is only used in `./.eslintrc.js` and in the tests – it’s not part
// of the eslint-config-prettier npm package.

const config = require(".");

module.exports = {
  extends: [
    "google",
    "plugin:flowtype/recommended",
    "plugin:react/all",
    "plugin:unicorn/recommended",
    "plugin:vue/recommended",
  ],
  plugins: [
    "prettier",
    ...new Set(
      Object.keys(config.rules)
        .map((ruleName) => ruleName.split("/"))
        .filter((parts) => parts.length > 1)
        .map((parts) => parts[0])
    ),
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2018,
    sourceType: "script",
    // Needed for the lint-verify-fail.test.js test.
    loggerFn: () => {},
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    "indent": "off",
    "linebreak-style": "off",
    "no-dupe-keys": "error",
    "strict": "error",
    "prefer-spread": "off",
    "require-jsdoc": "off",
    "prettier/prettier": "error",
    // Force a conflict with eslint-plugin-prettier in test-lint/prettier.js.
    "prefer-arrow-callback": "error",
    // Force a conflict with Prettier in test-lint/flowtype.js.
    "flowtype/object-type-delimiter": ["error", "semicolon"],
    "react/jsx-filename-extension": "off",
    "react/jsx-no-bind": "off",
    // Force a conflict with Prettier in test-lint/standard.js.
    "standard/computed-property-even-spacing": ["error", "even"],
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/no-empty-file": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-null": "off",
    "unicorn/no-reduce": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-flat-map": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prefer-node-protocol": "off",
    "unicorn/prefer-spread": "off",
    "unicorn/prefer-top-level-await": "off",
    "unicorn/prevent-abbreviations": "off",
    // Force a conflict with Prettier in test-lint/@babel.js. and test-lint/babel.js.
    "object-curly-spacing": "off",
    "babel/object-curly-spacing": ["error", "never"],
    "@babel/object-curly-spacing": ["error", "never"],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: { parser: "@typescript-eslint/parser" },
      rules: {
        // Force a conflict with Prettier in test-lint/typescript.js.
        // This is included in "plugin:@typescript-eslint/recommended".
        "@typescript-eslint/indent": "error",
      },
    },
  ],
  settings: {
    react: {
      version: "16",
    },
  },
};
