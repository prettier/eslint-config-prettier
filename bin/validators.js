"use strict";

// These validator functions answer the question “Is the config valid?” – return
// `false` if the options DO conflict with Prettier, and `true` if they don’t.

module.exports = {
  "curly"({ options }) {
    if (options.length === 0) {
      return true;
    }

    const firstOption = options[0];
    return firstOption !== "multi-line" && firstOption !== "multi-or-nest";
  },

  "lines-around-comment"({ options }) {
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

  "no-confusing-arrow"({ options }) {
    if (options.length === 0) {
      return false;
    }

    const firstOption = options[0];
    return firstOption ? firstOption.allowParens === false : false;
  },

  "no-tabs"({ options }) {
    if (options.length === 0) {
      return false;
    }

    const firstOption = options[0];
    return Boolean(firstOption && firstOption.allowIndentationTabs);
  },

  "unicorn/template-indent"({ options }) {
    if (!options[0]) {
      return false;
    }

    const firstOption = options[0];

    return !Boolean(
      firstOption.comments?.includes("HTML") ||
        firstOption.tags?.includes("css") ||
        firstOption.tags?.includes("graphql") ||
        firstOption.tags?.includes("gql") ||
        firstOption.tags?.includes("html") ||
        firstOption.tags?.includes("markdown") ||
        firstOption.tags?.includes("md")
    );
  },

  "vue/html-self-closing"({ options }) {
    if (options.length === 0) {
      return false;
    }

    const firstOption = options[0];
    return Boolean(
      firstOption && firstOption.html && firstOption.html.void === "any"
      // Enable when Prettier supports SVG: https://github.com/prettier/prettier/issues/5322
      // && firstOption.svg === "any"
    );
  },
};
