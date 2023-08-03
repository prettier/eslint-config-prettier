"use strict";

// This file is only used in `./eslint.config.js` and in the tests – it’s not part
// of the eslint-config-prettier npm package.
//
// NOTE: Keep this file in sync with `./.eslintrc.base.js`!

const fs = require("fs");
const path = require("path");
const babelOld = require("eslint-plugin-babel");
const babelNew = require("@babel/eslint-plugin");
const babelParser = require("@babel/eslint-parser");
const flowtype = require("eslint-plugin-flowtype");
const globals = require("globals");
const google = require("eslint-config-google");
const prettier = require("eslint-plugin-prettier");
const react = require("eslint-plugin-react");
const standard = require("eslint-plugin-standard");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const unicorn = require("eslint-plugin-unicorn");
const vue = require("eslint-plugin-vue");
const vueParser = require("vue-eslint-parser");
const eslintrcBase = require("./.eslintrc.base");

module.exports = [
  {
    ignores: fs
      .readFileSync(path.join(__dirname, ".eslintignore"), "utf8")
      .trim()
      .split("\n"),
  },
  {
    // TODO
    // ignores: ["test-lint/flowtype.js"],
  },
  google,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "babel": babelOld,
      "@babel": babelNew,
      prettier,
      standard,
    },
  },
  {
    plugins: {
      flowtype,
    },
    rules: flowtype.configs.recommended.rules,
    settings: flowtype.configs.recommended.settings,
  },
  {
    plugins: {
      react,
    },
    rules: react.configs.all.rules,
  },
  {
    plugins: {
      unicorn,
    },
    rules: unicorn.configs.recommended.rules,
  },
  {
    languageOptions: {
      ecmaVersion: eslintrcBase.parserOptions.ecmaVersion,
      sourceType: eslintrcBase.parserOptions.sourceType,
      globals: {
        ...globals.es6,
        ...globals.node,
      },
      parser: babelParser,
      parserOptions: {
        babelOptions: {
          plugins: [
            "@babel/plugin-transform-react-jsx",
            "@babel/plugin-syntax-flow",
          ],
        },
        loggerFn: eslintrcBase.parserOptions.loggerFn,
        ecmaFeatures: eslintrcBase.parserOptions.ecmaFeatures,
      },
    },
    rules: eslintrcBase.rules,
    settings: eslintrcBase.settings,
  },
  {
    files: ["**/*.vue"],
    processor: vue.processors[".vue"],
    languageOptions: {
      parser: vueParser,
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs.base.rules,
      ...vue.configs.essential.rules,
      ...vue.configs["strongly-recommended"].rules,
      ...vue.configs.recommended.rules,
    },
  },
  ...eslintrcBase.overrides.map(({ parserOptions, ...override }) => ({
    ...override,
    languageOptions: { parser: require(parserOptions.parser) },
  })),
];
