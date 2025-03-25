// This file is only used in `./eslint.config.js` and in the tests – it’s not part
// of the eslint-config-prettier npm package.
//
// NOTE: Keep this file in sync with `./.eslintrc.base.js`!

import { createRequire } from "node:module";

import babelNew from "@babel/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import stylistic from "@stylistic/eslint-plugin";
import stylisticJs from "@stylistic/eslint-plugin-js";
import stylisticJsx from "@stylistic/eslint-plugin-jsx";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import standard from "eslint-plugin-standard";
import babelOld from "eslint-plugin-babel";
import flowtype from "eslint-plugin-flowtype";
import google from "eslint-config-google";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import unicorn from "eslint-plugin-unicorn";
import vue from "eslint-plugin-vue";
import globals from "globals";

import eslintrcBase from "./.eslintrc.base.js";

const require = createRequire(import.meta.url);

export default [
  {
    ignores: require("./package.json").eslintIgnore,
  },
  {
    // TODO: Figure out how to get flowtype running in flat config.
    ignores: ["test-lint/flowtype.js"],
  },
  google,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "babel": babelOld,
      "@babel": babelNew,
      "@stylistic": stylistic,
      "@stylistic/js": stylisticJs,
      "@stylistic/jsx": stylisticJsx,
      "@stylistic/ts": stylisticTs,
      "flowtype": fixupPluginRules(flowtype),
      standard,
    },
  },
  {
    rules: flowtype.configs.recommended.rules,
    settings: flowtype.configs.recommended.settings,
  },
  prettier,
  unicorn.configs["flat/recommended"],
  ...vue.configs["flat/base"],
  ...vue.configs["flat/essential"],
  ...vue.configs["flat/strongly-recommended"],
  ...vue.configs["flat/recommended"],
  {
    languageOptions: {
      ...eslintrcBase.parserOptions,
      globals: {
        ...globals.es6,
        ...globals.node,
      },
    },
    rules: eslintrcBase.rules,
    settings: eslintrcBase.settings,
  },
  ...eslintrcBase.overrides
    .filter(({ parser, parserOptions }) => parser || parserOptions)
    .map(({ parser, parserOptions, ...override }) => ({
      ...override,
      languageOptions: parser
        ? { parser: require(parser), ...parserOptions }
        : parserOptions,
    })),
  {
    files: ["test-lint/react.js"],
    ...react.configs.flat.all,
    rules: {
      ...react.configs.flat.all.rules,
      "react/jsx-filename-extension": "off",
      "react/jsx-no-bind": "off",
    },
  },
  { files: ["test-lint/@stylistic.js"], ...stylistic.configs.all },
  {
    files: ["test-lint/@stylistic__js.js"],
    ...stylisticJs.configs.all,
  },
  {
    files: ["test-lint/@stylistic__jsx.jsx"],
    ...stylisticJsx.configs.all,
  },
  {
    files: ["test-lint/@stylistic__ts.ts"],
    ...stylisticTs.configs.all,
  },
];
