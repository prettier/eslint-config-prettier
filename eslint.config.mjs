// This is the internal ESLint config for this project itself – it’s not part of
// the eslint-config-prettier npm package. The idea here is to extend some
// sharable config from npm and then include the configs exposed by this package
// as an “eat your own dogfood” test. That feels like a good test, but
// complicates things a little sometimes.
//
// NOTE: Keep this file in sync with `./.eslintrc.js`!

import globals from "globals";
import base from "./eslint.base.config.mjs";
import flat from "./flat.js";
import prettier from "./prettier.js";
import eslintrc from "./.eslintrc.js";

export default [
  ...base,
  flat,
  prettier,
  {
    rules: eslintrc.rules,
  },
  ...eslintrc.overrides.map(
    ({ env = {}, parserOptions = {}, ...override }) => ({
      ...override,
      languageOptions: {
        globals: Object.entries(env).reduce(
          (acc, [key, enabled]) =>
            enabled ? { ...acc, ...globals[key] } : acc,
          {}
        ),
        parserOptions,
      },
    })
  ),
];
