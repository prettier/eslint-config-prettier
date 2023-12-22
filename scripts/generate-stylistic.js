"use strict";

const getRules = (postfix) =>
  Object.keys(require(`@stylistic/eslint-plugin${postfix}`).rules);

const plugins = Object.entries({
  js: "",
  ts: "@typescript-eslint/",
  jsx: "react/",
  plus: "",
}).map(([stylisticPlugin, externalPlugin]) => ({
  rules: getRules(`-${stylisticPlugin}`),
  stylisticPlugin,
  externalPlugin,
}));

// Validate that the unified plugin contains an equal number of rules as the individual plugin
require("assert/strict").strictEqual(
  ...[[getRules("")], plugins.map(({ rules }) => rules)].map(
    (group) => new Set(group.flat()).size
  )
);

const rulesBySeverity = {};
for (const delimiter of ["", "/"])
  for (const { stylisticPlugin, externalPlugin, rules } of plugins)
    for (const rule of rules) {
      const severity =
        stylisticPlugin == "plus"
          ? "off"
          : require("..").rules[
              externalPlugin +
                rule.replace(/^(func)tion(-call-spacing$)/, "$1$2")
            ];
      (rulesBySeverity[severity] ??= {})[
        `@stylistic/${delimiter && stylisticPlugin + delimiter}${rule}`
      ] = severity;
    }

const rulesForREADME = [
  ...`${require("fs").readFileSync(`${__dirname}/../README.md`)}`.matchAll(
    /### \[(.+)]/g
  ),
]
  .map(([, base]) =>
    Object.keys(rulesBySeverity[0]).filter((rule) => rule.endsWith(`/${base}`))
  )
  .filter(({ length }) => length);

console.log(
  rulesBySeverity,
  rulesForREADME.map(
    (rules) =>
      `(The following applies to ${rules
        .map((rule) => `[${rule}]`)
        .join(`${rules.length == 2 ? " and" : ","} `)} as well.)`
  ),
  rulesForREADME
    .flat()
    .map((rule) => {
      const ruleWithoutPrefix = rule.replace("@stylistic/", "");
      return `[${rule}]: https://eslint.style/rules/${
        ruleWithoutPrefix.includes("/") ? "" : "default/"
      }${ruleWithoutPrefix}`;
    })
    .join("\n")
);
