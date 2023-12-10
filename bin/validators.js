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
    const requiredProperties = [
      "allowBlockStart",
      "allowBlockEnd",
      "allowObjectStart",
      "allowObjectEnd",
      "allowArrayStart",
      "allowArrayEnd",
    ];

    return Boolean(
      firstOption && requiredProperties.every((prop) => firstOption[prop])
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
    if (options.length === 0) {
      return false;
    }

    const { comments = [], tags = [] } = options[0] || {};
    const forbiddenElements = new Set([
      "GraphQL",
      "HTML",
      "css",
      "graphql",
      "gql",
      "html",
      "markdown",
      "md",
    ]);

    const hasForbiddenElement = (array) =>
      array.some((element) => forbiddenElements.has(element));

    return (
      Array.isArray(comments) &&
      Array.isArray(tags) &&
      !(hasForbiddenElement(comments) || hasForbiddenElement(tags))
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
