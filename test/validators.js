"use strict";

const test = require("ava");
const validators = require("../bin/validators");

test("curly", t => {
  t.true(validators.curly([]), "no options allowed");
  t.true(validators.curly(["all"]), "'all' option allowed");
  t.true(validators.curly(["multi"]), "'multi' option allowed");
  t.false(validators.curly(["multi-line"]), "'multi-line' option disallowed");
  t.false(
    validators.curly(["multi-or-nest"]),
    "'multi-or-nest' option disallowed"
  );
  t.true(
    validators.curly(["multi", "consistent"]),
    "'consistent' makes no difference (1)"
  );
  t.false(
    validators.curly(["multi-line", "consistent"]),
    "'consistent' makes no difference (2)"
  );
});

test("lines-around-comment", t => {
  t.false(validators["lines-around-comment"]([]), "no options disallowed");
  t.true(
    validators["lines-around-comment"]([
      {
        allowBlockStart: true,
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true
      }
    ]),
    "allowing block/object/array start/end allowed"
  );
  t.false(
    validators["lines-around-comment"]([
      {
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true
      }
    ]),
    "missing one of the options disallowed"
  );
  t.false(
    validators["lines-around-comment"]([null]),
    "does not crash on bad input"
  );
});

test("no-confusing-arrow", t => {
  t.true(validators["no-confusing-arrow"]([]), "no options allowed");
  t.true(
    validators["no-confusing-arrow"]([{ allowParens: false }]),
    "'allowParens: false' option allowed"
  );
  t.false(
    validators["no-confusing-arrow"]([{ allowParens: true }]),
    "'allowParens: true' option disallowed"
  );
  t.true(
    validators["no-confusing-arrow"]([null]),
    "does not crash on bad input"
  );
});

test("quotes", t => {
  t.false(validators.quotes([]), "no options disallowed");
  t.false(validators.quotes(["double"]), "'double' option disallowed");
  t.false(validators.quotes(["single"]), "'single' option disallowed");
  t.true(validators.quotes(["backtick"]), "'backtick' option allowed");
  t.false(
    validators.quotes(["double", { avoidEscape: true }]),
    "object options makes no difference (1)"
  );
  t.true(
    validators.quotes(["backtick", { avoidEscape: true }]),
    "object options makes no difference (2)"
  );
});
