"use strict";

const validators = require("../bin/validators");

test("curly", () => {
  expect(validators.curly([])).toBe(true);
  expect(validators.curly(["all"])).toBe(true);
  expect(validators.curly(["multi"])).toBe(true);
  expect(validators.curly(["multi-line"])).toBe(false);
  expect(validators.curly(["multi-or-nest"])).toBe(false);
  expect(validators.curly(["multi", "consistent"])).toBe(true);
  expect(validators.curly(["multi-line", "consistent"])).toBe(false);
});

test("lines-around-comment", () => {
  expect(validators["lines-around-comment"]([])).toBe(false);
  expect(
    validators["lines-around-comment"]([
      {
        allowBlockStart: true,
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true
      }
    ])
  ).toBe(true);
  expect(
    validators["lines-around-comment"]([
      {
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true
      }
    ])
  ).toBe(false);
  expect(validators["lines-around-comment"]([null])).toBe(false);
});

test("no-confusing-arrow", () => {
  expect(validators["no-confusing-arrow"]([])).toBe(true);
  expect(validators["no-confusing-arrow"]([{ allowParens: false }])).toBe(true);
  expect(validators["no-confusing-arrow"]([{ allowParens: true }])).toBe(false);
  expect(validators["no-confusing-arrow"]([null])).toBe(true);
});

test("vue/html-self-closing", () => {
  expect(validators["vue/html-self-closing"]([])).toBe(false);
  expect(validators["vue/html-self-closing"]([{ html: { void: "any" } }])).toBe(
    true
  );
  expect(
    validators["vue/html-self-closing"]([
      {
        html: {
          void: "any",
          html: "never",
          component: "never"
        },
        svg: "never",
        math: "never"
      }
    ])
  ).toBe(true);
  expect(validators["vue/html-self-closing"]([null])).toBe(false);
  expect(validators["vue/html-self-closing"]([{ html: null }])).toBe(false);
  expect(
    validators["vue/html-self-closing"]([{ html: { void: "always" } }])
  ).toBe(false);
});
