"use strict";

// These validator functions answer the question “Is the config valid?” – return
// `false` if the options DO conflict with Prettier, and `true` if they don’t.

const eq = (value, expected) =>
  value == undefined ||
  (typeof expected === "function" ? expected(value) : expected === value);

module.exports = {
  curly(options) {
    if (options.length === 0) {
      return true;
    }

    const firstOption = options[0];
    return firstOption !== "multi-line" && firstOption !== "multi-or-nest";
  },

  "lines-around-comment"(options) {
    if (options.length === 0) {
      return false;
    }

    const firstOption = options[0];
    return Boolean(
      firstOption &&
        firstOption.allowBlockStart &&
        firstOption.allowBlockEnd &&
        firstOption.allowObjectStart &&
        firstOption.allowObjectEnd &&
        firstOption.allowArrayStart &&
        firstOption.allowArrayEnd
    );
  },

  "no-confusing-arrow"(options) {
    if (options.length === 0) {
      return true;
    }

    const firstOption = options[0];
    return !(firstOption && firstOption.allowParens);
  },

  "vue/html-self-closing"(options) {
    if (options.length === 0) {
      return false;
    }

    const firstOption = options[0];
    return Boolean(
      firstOption && (firstOption.html && firstOption.html.void === "any")
      // Enable when Prettier supports SVG: https://github.com/prettier/prettier/issues/5322
      // && firstOption.svg === "any"
    );
  },

  "typescript/member-delimiter-style"(options) {
    return Boolean(
      eq(options[0], first => typeof first === "object") &&
        eq(
          options[0],
          ({ singleline, multiline }) =>
            eq(
              singleline,
              ({ delimiter, requireLast }) =>
                eq(delimiter, "semi") && eq(requireLast, false)
            ) &&
            eq(
              multiline,
              ({ delimiter, requireLast }) =>
                eq(delimiter, d => ["none", "semi"].includes(d)) &&
                eq(requireLast, true)
            )
        )
    );
  },

  "typescript/type-annotation-spacing"(options) {
    return options.length === 0;
  }
};
