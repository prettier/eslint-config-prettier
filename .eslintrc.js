"use strict";

// This is the internal ESLint config for this project itself – it’s not part of
// the eslint-config-prettier npm package. The idea here is to extend some
// sharable config from npm and then include the configs exposed by this package
// as an “eat your own dogfood” test. That feels like a good test, but
// complicates things a little sometimes.

const fs = require("fs");

module.exports = {
  extends: [
    "./.eslintrc.base.js",
    ...fs
      .readdirSync(__dirname)
      .filter((file) => !file.startsWith(".") && file.endsWith(".js"))
      .map((ruleFileName) => `./${ruleFileName}`),
  ],
  rules: {
    "prettier/prettier": "off",
  },
  overrides: [
    {
      files: ["{bin,test}/**/*.js"],
      rules: {
        "no-undef": "error",
        "no-restricted-syntax": [
          "error",
          {
            selector: "SequenceExpression",
            message:
              "The comma operator is confusing and a common mistake. Don’t use it!",
          },
        ],
        quotes: [
          "error",
          "double",
          { avoidEscape: true, allowTemplateLiterals: false },
        ],
      },
    },
    {
      files: ["*.test.js"],
      env: { jest: true },
    },
  ],
};
