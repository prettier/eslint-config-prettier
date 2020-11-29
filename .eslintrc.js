"use strict";

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
