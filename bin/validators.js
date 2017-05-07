"use strict";

module.exports = {
  curly(options) {
    if (options.length < 1) {
      return true;
    }

    const firstOption = options[0];
    return firstOption !== "multi-line" && firstOption !== "multi-or-nest";
  },

  "no-confusing-arrow"(options) {
    if (options.length < 1) {
      return true;
    }

    const firstOption = options[0];
    return !(firstOption && firstOption.allowParens);
  },

  quotes(options) {
    if (options.length < 1) {
      return false;
    }

    const firstOption = options[0];
    return firstOption === "backtick";
  }
};
