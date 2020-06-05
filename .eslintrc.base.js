"use strict";

const pkg = require("./package.json");

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
    ...pkg.files
      .filter((name) => !name.includes("/") && name !== "index.js")
      .map((ruleFileName) => ruleFileName.replace(/\.js$/, "")),
  ],
  parserOptions: {
    parser: "babel-eslint",
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
    indent: "off",
    "no-dupe-keys": "error",
    strict: "error",
    "prefer-spread": "off",
    "require-jsdoc": "off",
    "prettier/prettier": ["error", {}],
    // Force a conflict with Prettier in test-lint/flowtype.js.
    "flowtype/object-type-delimiter": ["error", "semicolon"],
    "react/jsx-filename-extension": "off",
    "react/jsx-no-bind": "off",
    // Force a conflict with Prettier in test-lint/standard.js.
    "standard/computed-property-even-spacing": ["error", "even"],
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-nested-ternary": "off",
    "unicorn/no-null": "off",
    "unicorn/no-reduce": "off",
    "unicorn/prefer-flat-map": "off",
    "unicorn/prevent-abbreviations": "off",
    // Force a conflict with Prettier in test-lint/babel.js.
    "object-curly-spacing": "off",
    "babel/object-curly-spacing": ["error", "never"],
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
