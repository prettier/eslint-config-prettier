/* eslint-disable quotes */
/* eslint-disable space-before-function-paren */
"use strict";

function foo() {
  return (
    isTrue &&
    [0, 1, 2].map(function (num) {
      return num * 2;
    })
  );
}

foo();
