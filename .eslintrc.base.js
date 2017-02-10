"use strict";

module.exports = {
  extends: ["google", "plugin:react/all"],
  plugins: ["react", "prettier"],
  env: {
    es6: true,
    node: true
  },
  rules: {
    strict: "error",
    "require-jsdoc": "off",
    "prettier/prettier": "error",
    "react/jsx-filename-extension": "off"
  }
};
