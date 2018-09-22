// @flow
/* eslint-disable quotes */
"use strict";

// Prettier wants commas as delimiters, but the "flowtype" rule added in
// .eslintrc.base.js wants semicolons.
type Foo = { a: Foo, b: Bar };
