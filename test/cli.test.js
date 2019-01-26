"use strict";

const cli = require("../bin/cli");

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

describe("does not flag", () => {
  const rules = ["strict", "arrow-parens", "curly", "max-len"];

  const results = offPatterns.map(pattern => ({
    pattern: JSON.stringify(pattern),
    result: cli.processString(createRules(rules, pattern))
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

  const results = onPatterns.map(
    pattern => ({
      pattern: JSON.stringify(pattern),
      result: cli.processString(createRules(rules, pattern))
    }),
    {}
  );

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
  expect(cli.processString(createRules(rules, "error"))).toMatchInlineSnapshot(`
Object {
  "code": 0,
  "stdout": "No rules that are unnecessary or conflict with Prettier were found.",
}
`);
});

test("conflicting options", () => {
  const rules = ["strict", ["curly", "multi-line"]];
  expect(cli.processString(createRules(rules, "error"))).toMatchInlineSnapshot(`
Object {
  "code": 2,
  "stdout": "The following rules are enabled with options that might conflict with Prettier. See:
https://github.com/prettier/eslint-config-prettier#special-rules

- curly",
}
`);
});

test("special rules", () => {
  const rules = ["strict", "max-len"];
  expect(cli.processString(createRules(rules, "error"))).toMatchInlineSnapshot(`
Object {
  "code": 0,
  "stdout": "No rules that are unnecessary or conflict with Prettier were found.

However, the following rules are enabled but cannot be automatically checked. See:
https://github.com/prettier/eslint-config-prettier#special-rules

- max-len",
}
`);
});

test("all the things", () => {
  const rules = [
    "strict",
    "max-len",
    "arrow-spacing",
    "quotes",
    "arrow-parens",
    "no-tabs",
    "lines-around-comment",
    "no-unexpected-multiline",
    "no-mixed-operators",
    ["curly", "multi-or-nest", "consistent"],
    ["no-confusing-arrow", { allowParens: true }],
    "react/jsx-indent",
    "flowtype/semi",
    "vue/html-self-closing",
    "prefer-arrow-callback",
    "arrow-body-style"
  ];
  expect(cli.processString(createRules(rules, "error"))).toMatchInlineSnapshot(`
Object {
  "code": 2,
  "stdout": "The following rules are unnecessary or might conflict with Prettier:

- arrow-parens
- arrow-spacing
- flowtype/semi
- react/jsx-indent

The following rules are enabled with options that might conflict with Prettier. See:
https://github.com/prettier/eslint-config-prettier#special-rules

- curly
- lines-around-comment
- no-confusing-arrow
- vue/html-self-closing

The following rules are enabled but cannot be automatically checked. See:
https://github.com/prettier/eslint-config-prettier#special-rules

- arrow-body-style
- max-len
- no-mixed-operators
- no-tabs
- no-unexpected-multiline
- prefer-arrow-callback
- quotes",
}
`);
});

test("invalid JSON", () => {
  expect(cli.processString("a")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Failed to parse JSON:
Unexpected token a in JSON at position 0",
}
`);
  expect(cli.processString('{"rules": {')).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Failed to parse JSON:
Unexpected end of JSON input",
}
`);
});

test("invalid config", () => {
  expect(cli.processString("null")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
null",
}
`);

  expect(cli.processString("true")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
true",
}
`);

  expect(cli.processString("false")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
false",
}
`);

  expect(cli.processString("1")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
1",
}
`);

  expect(cli.processString('"string"')).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
\\"string\\"",
}
`);

  expect(cli.processString("[1, true]")).toMatchInlineSnapshot(`
Object {
  "code": 1,
  "stderr": "Expected a \`{\\"rules: {...}\\"}\` JSON object, but got:
[1, true]",
}
`);
});
