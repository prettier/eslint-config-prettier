/* eslint-disable quotes */
"use strict";

// Prettier wants semicolons as delimiters, but the "typescript" rule added in
// .eslintrc.base.js wants commas.
interface Foo {
  a: Foo;
  b: Bar;
}

function add(a: number, b: number): number {
  return a + b;
}
