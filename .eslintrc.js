"use strict";

const pkg = require("./package.json");

module.exports = {
  extends: [
    "./.eslintrc.base.js",
    ...pkg.files
      .filter((name) => !name.includes("/"))
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
