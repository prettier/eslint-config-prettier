/* eslint-disable quotes */
"use strict";

// Prettier wants number literals to be lowercase, but
// `plugin:unicorn/recommended` wants them uppercase.
0xffffff;

// Prettier wants line break in `try`, but
// `plugin:unicorn/recommended` wants whitespace removed.
try {
} catch (_error) {}
