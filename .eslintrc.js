"use strict";

const pkg = require("./package.json");

module.exports = {
  extends: [
    "./.eslintrc.base.js",
    ...pkg.files
      .filter(name => !name.includes("/"))
      .map(ruleFileName => `./${ruleFileName}`)
  ],
  overrides: [
    {
      files: ["{bin,test}/**/*.js"],
      rules: {
        "no-undef": "error"
      }
    },
    {
      files: ["*.test.js"],
      env: { jest: true }
    }
  ]
};
