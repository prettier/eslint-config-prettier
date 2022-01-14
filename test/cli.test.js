"use strict";

const cli = require("../bin/cli");

const offPatterns = [0, "off", [0], ["off"], ["off", "never"]];
const onPatterns = [1, 2, "warn", "error", [1], [2], ["warn"], ["error"]];

function createRules(rules, pattern) {
  const arrayPattern = Array.isArray(pattern) ? pattern : [pattern];
  return rules.map((rule) => {
    const value = Array.isArray(rule)
      ? arrayPattern.concat(rule.slice(1))
      : pattern;
    const name = Array.isArray(rule) ? rule[0] : rule;
    return [name, value, "test-source.js"];
  });
}

describe("does not flag", () => {
  const rules = ["strict", "arrow-parens", "curly", "max-len"];

  const results = offPatterns.map((pattern) => ({
    pattern: JSON.stringify(pattern),
    result: cli.processRules(createRules(rules, pattern)),
  }));

  test("result", () => {
    expect(results[0].result).toMatchInlineSnapshot(`
      Object {
        "code": 0,
        "stdout": "No rules that are unnecessary or conflict with Prettier were found.",
      }
    `);
  });

  results.forEach(({ pattern, result }) => {
    test(pattern, () => {
      expect(result).toEqual(results[0].result);
    });
  });
});

describe("does flag", () => {
  const rules = ["strict", "arrow-parens"];

  const results = onPatterns.map((pattern) => ({
    pattern: JSON.stringify(pattern),
    result: cli.processRules(createRules(rules, pattern)),
  }));

  test("result", () => {
    expect(results[0].result).toMatchInlineSnapshot(`
      Object {
        "code": 2,
        "stdout": "The following rules are unnecessary or might conflict with Prettier:

      - arrow-parens",
      }
    `);
  });

  results.forEach(({ pattern, result }) => {
    test(pattern, () => {
      expect(result).toEqual(results[0].result);
    });
  });
});

test("no results", () => {
  const rules = ["strict", "curly"];
  expect(cli.processRules(createRules(rules, "error"))).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "stdout": "No rules that are unnecessary or conflict with Prettier were found.",
    }
  `);
});

test("conflicting options", () => {
  const rules = ["strict", ["curly", "multi-line"]];
  expect(cli.processRules(createRules(rules, "error"))).toMatchInlineSnapshot(`
    Object {
      "code": 2,
      "stdout": "The following rules are enabled with config that might conflict with Prettier. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - curly",
    }
  `);
});

test("special rules", () => {
  const rules = ["strict", "max-len"];
  expect(cli.processRules(createRules(rules, "error"))).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "stdout": "The following rules are enabled but cannot be automatically checked. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - max-len

    Other than that, no rules that are unnecessary or conflict with Prettier were found.",
    }
  `);
});

test("all the things", () => {
  const rules = [
    "strict",
    "max-len",
    "arrow-spacing",
    "arrow-spacing",
    "quotes",
    ["quotes", "double"],
    "arrow-parens",
    "no-tabs",
    "lines-around-comment",
    "no-unexpected-multiline",
    "no-mixed-operators",
    "curly",
    ["curly", "multi-line"],
    ["curly", "multi-or-nest", "consistent"],
    ["no-confusing-arrow", { allowParens: true }],
    "react/jsx-indent",
    "flowtype/semi",
    "vue/html-self-closing",
    "prefer-arrow-callback",
    "arrow-body-style",
  ];
  expect(cli.processRules(createRules(rules, "error"))).toMatchInlineSnapshot(`
    Object {
      "code": 2,
      "stdout": "The following rules are unnecessary or might conflict with Prettier:

    - arrow-parens
    - arrow-spacing
    - flowtype/semi
    - react/jsx-indent

    The following rules are enabled with config that might conflict with Prettier. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - curly
    - lines-around-comment
    - no-confusing-arrow
    - no-tabs
    - vue/html-self-closing

    The following rules are enabled but cannot be automatically checked. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - max-len
    - no-mixed-operators
    - no-unexpected-multiline
    - quotes",
    }
  `);
});

test("eslint-plugin-prettier", () => {
  expect(
    cli.processRules([
      ["prettier/prettier", "error", "test-source.js"],
      ["arrow-body-style", "error", "test-source.js"],
      ["prefer-arrow-callback", "error", "test-source.js"],
    ])
  ).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "stdout": "The following rules can cause issues when using eslint-plugin-prettier at the same time.
    Only enable them if you know what you are doing! See:
    https://github.com/prettier/eslint-config-prettier#arrow-body-style-and-prefer-arrow-callback

    - arrow-body-style
    - prefer-arrow-callback

    Other than that, no rules that are unnecessary or conflict with Prettier were found.",
    }
  `);
});

test("eslint-plugin-prettier no warnings because different sources", () => {
  expect(
    cli.processRules([
      ["prettier/prettier", "error", "test-source.js"],
      ["arrow-body-style", "error", "other.js"],
      ["prefer-arrow-callback", "error", "other.js"],
    ])
  ).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "stdout": "No rules that are unnecessary or conflict with Prettier were found.",
    }
  `);
});

test("eslint-plugin-prettier no warnings because the rule is off", () => {
  expect(
    cli.processRules([
      ["prettier/prettier", [0, {}], "test-source.js"],
      ["arrow-body-style", "error", "test-source.js"],
      ["prefer-arrow-callback", "error", "test-source.js"],
    ])
  ).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "stdout": "No rules that are unnecessary or conflict with Prettier were found.",
    }
  `);
});
