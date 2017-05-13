"use strict";

const test = require("ava");
const dedent = require("dedent");
const cli = require("../bin/cli");

function invalidJSONMacro(t, input) {
  const result = cli.processString(input);
  t.true(result.stderr.startsWith("Failed to parse JSON:\n"));
  t.is(result.code, 1);
}
invalidJSONMacro.title = (providedTitle, input) =>
  `${providedTitle} Handles invalid JSON: ${input}`.trim();

test(invalidJSONMacro, "a");
test(invalidJSONMacro, '{"rules": {');

function invalidConfigMacro(t, input) {
  const result = cli.processString(input);
  t.is(
    result.stderr,
    `Expected a \`{"rules: {...}"}\` JSON object, but got:\n${input}`
  );
  t.is(result.code, 1);
}
invalidConfigMacro.title = (providedTitle, input) =>
  `${providedTitle} Handles invalid config: ${input}`.trim();

test(invalidConfigMacro, "null");
test(invalidConfigMacro, "true");
test(invalidConfigMacro, "false");
test(invalidConfigMacro, "1");
test(invalidConfigMacro, '"string"');
test(invalidConfigMacro, "[1, true]");

const offPatterns = [0, "off", [0], ["off"], ["off", "never"]];

const onPatterns = [1, 2, "warn", "error", [1], [2], ["warn"], ["error"]];

function createRules(rules, pattern) {
  const arrayPattern = Array.isArray(pattern) ? pattern : [pattern];
  const rulesString = rules
    .map(rule => {
      const value = Array.isArray(rule)
        ? arrayPattern.concat(rule.slice(1))
        : pattern;
      const name = Array.isArray(rule) ? rule[0] : rule;
      return `"${name}": ${JSON.stringify(value)}`;
    })
    .join(", ");
  return `{"rules": {${rulesString}}}`;
}

function rulesMacroTitle(title) {
  return (providedTitle, rules) =>
    `${providedTitle} ${title}: ${rules
      .map(rule => JSON.stringify(rule))
      .join(", ")}`.trim();
}

function offRulesMacro(t, rules) {
  offPatterns.forEach(pattern => {
    const result = cli.processString(createRules(rules, pattern));
    t.is(result.code, 0);
    t.is(
      result.stdout,
      "No rules that are unnecessary or conflict with Prettier were found."
    );
  });
}
offRulesMacro.title = rulesMacroTitle("Does not flag");

test(offRulesMacro, ["strict", "arrow-parens", "curly", "max-len"]);

function onRulesMacro(t, rules, expected, expectedCode) {
  onPatterns.forEach(pattern => {
    const result = cli.processString(createRules(rules, pattern));
    t.is(result.code, expectedCode);
    t.is(result.stdout, expected);
  });
}
onRulesMacro.title = rulesMacroTitle("Does flag");

test(
  onRulesMacro,
  ["strict", "arrow-parens"],
  dedent`
    The following rules are unnecessary or might conflict with Prettier:

    - arrow-parens
  `,
  2
);

test(
  onRulesMacro,
  ["strict", "curly"],
  dedent`
    No rules that are unnecessary or conflict with Prettier were found.
  `,
  0
);

test(
  onRulesMacro,
  ["strict", ["curly", "multi-line"]],
  dedent`
    The following rules are enabled with options that might conflict with Prettier. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - curly
  `,
  2
);

test(
  onRulesMacro,
  ["strict", "max-len"],
  dedent`
    No rules that are unnecessary or conflict with Prettier were found.

    However, the following rules are enabled but cannot be automatically checked. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - max-len
  `,
  0
);

test(
  onRulesMacro,
  [
    "strict",
    "max-len",
    "arrow-spacing",
    "quotes",
    "arrow-parens",
    "no-tabs",
    "no-mixed-operators",
    ["curly", "multi-or-nest", "consistent"],
    ["no-confusing-arrow", { allowParens: true }],
    "react/jsx-indent",
    "flowtype/semi"
  ],
  dedent`
    The following rules are unnecessary or might conflict with Prettier:

    - arrow-parens
    - arrow-spacing
    - flowtype/semi
    - react/jsx-indent

    The following rules are enabled with options that might conflict with Prettier. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - curly
    - no-confusing-arrow
    - quotes

    The following rules are enabled but cannot be automatically checked. See:
    https://github.com/prettier/eslint-config-prettier#special-rules

    - max-len
    - no-mixed-operators
    - no-tabs
  `,
  2
);
