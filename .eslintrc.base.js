"use strict";

module.exports = {
  extends: ["google", "plugin:flowtype/recommended", "plugin:react/all"],
  plugins: ["flowtype", "react", "prettier"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: "script",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    strict: "error",
    "prefer-spread": "off",
    "require-jsdoc": "off",
    "prettier/prettier": "error",
    // Force a conflict with prettier in test-lint/flowtype.js.
    "flowtype/object-type-delimiter": ["error", "semicolon"],
    "react/jsx-filename-extension": "off"
  }
};
