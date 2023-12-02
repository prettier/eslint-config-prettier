"use strict";

const validators = require("../bin/validators");
const { inspect } = require("util");

expect.extend({
  toPass(validator, options) {
    const pass = validator({ options, source: "test-source.js" }, []);
    return {
      message: () =>
        `expected ${inspect(options)} to be ${pass ? "invalid" : "valid"}`,
      pass,
    };
  },
});

function rule(name, { valid, invalid }) {
  test(name, () => {
    const validator = validators[name];
    valid.forEach((options) => expect(validator).toPass(options));
    invalid.forEach((options) => expect(validator).not.toPass(options));
  });
}

rule("curly", {
  valid: [[], , ["all"], ["multi"], ["multi", "consistent"]],
  invalid: [["multi-line"], ["multi-or-nest"], ["multi-line", "consistent"]],
});

rule("lines-around-comment", {
  valid: [
    [
      {
        allowBlockStart: true,
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true,
      },
    ],
  ],
  invalid: [
    [],
    [
      {
        allowBlockEnd: true,
        allowObjectStart: true,
        allowObjectEnd: true,
        allowArrayStart: true,
        allowArrayEnd: true,
      },
    ],
    [null],
  ],
});

rule("no-confusing-arrow", {
  valid: [[{ allowParens: false }]],
  invalid: [[], [null], [{ allowParens: true }], [{ other: true }]],
});

rule("no-tabs", {
  valid: [[{ allowIndentationTabs: true }]],
  invalid: [[], [null], [{ allowIndentationTabs: false }], [{ other: true }]],
});

rule("unicorn/template-indent", {
  valid: [
    [
      {
        tags: ["outdent", "dedent", "sql", "styled"],
        functions: ["dedent", "stripIndent"],
        selectors: [],
        comments: ["indent"],
      },
    ],
    [
      {
        comments: ["indent"],
      },
    ],
  ],
  invalid: [
    [],
    [{ comments: ["GraphQL"] }],
    [{ comments: ["HTML"] }],
    [{ tags: ["css"] }],
    [{ tags: ["graphql"] }],
    [{ tags: ["gql"] }],
    [{ tags: ["html"] }],
    [{ tags: ["markdown"] }],
    [{ tags: ["md"] }],
    [{ comments: 5 }],
    [{ tags: {} }],
    [
      {
        tags: ["outdent", "dedent", "gql", "sql", "html", "styled"],
      },
    ],
  ],
});

rule("vue/html-self-closing", {
  valid: [
    [{ html: { void: "any" } }],
    [
      {
        html: {
          void: "any",
          html: "never",
          component: "never",
        },
        svg: "never",
        math: "never",
      },
    ],
  ],
  invalid: [[], [null], [{ html: null }], [{ html: { void: "always" } }]],
});
