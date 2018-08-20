"use strict";

const pkg = require("./package.json");

module.exports = {
  extends: ["google", "plugin:flowtype/recommended", "plugin:react/all"],
  plugins: [
    "prettier",
    ...pkg.files
      .filter(name => !name.includes("/") && name !== "index.js")
      .map(ruleFileName => ruleFileName.replace(/\.js$/, ""))
  ],
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
    "standard/computed-property-even-spacing": ["error", "even"]
  },
  settings: {
    react: {
      version: "16"
    }
  }
};
