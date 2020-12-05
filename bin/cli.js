#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const validators = require("./validators");

// Require locally installed eslint, for `npx eslint-config-prettier` support
// with no local eslint-config-prettier installation.
const { ESLint } = require(require.resolve("eslint", {
  paths: [process.cwd(), ...require.resolve.paths("eslint")],
}));

const SPECIAL_RULES_URL =
  "https://github.com/prettier/eslint-config-prettier#special-rules";

if (module === require.main) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(help());
    process.exit(1);
  }

  const eslint = new ESLint();

  Promise.all(args.map((file) => eslint.calculateConfigForFile(file)))
    .then((configs) => {
      const rules = [].concat(
        ...configs.map((config, index) =>
          Object.entries(config.rules).map((entry) => [...entry, args[index]])
        )
      );
      const result = processRules(rules);
      if (result.stderr) {
        console.error(result.stderr);
      }
      if (result.stdout) {
        console.error(result.stdout);
      }
      process.exit(result.code);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

function help() {
  return `
Usage: npx eslint-config-prettier FILE...

Resolves an ESLint configuration for every given FILE and checks if they
contain rules that are unnecessary or conflict with Prettier. Example:

  npx eslint-config-prettier index.js test/index.js other/file/to/check.js

Exit codes:

0: No automatically detectable problems found.
1: General error.
2: Conflicting rules found.

For more information, see:
https://github.com/prettier/eslint-config-prettier#cli-helper-tool
  `.trim();
}

function processRules(configRules) {
  // This used to look at "files" in package.json, but that is not reliable due
  // to an npm bug. See:
  // https://github.com/prettier/eslint-config-prettier/issues/57
  const allRules = Object.assign(
    Object.create(null),
    ...fs
      .readdirSync(path.join(__dirname, ".."))
      .filter((name) => !name.startsWith(".") && name.endsWith(".js"))
      .map((ruleFileName) => require(`../${ruleFileName}`).rules)
  );

  const regularRules = filterRules(allRules, (_, value) => value === "off");
  const optionsRules = filterRules(
    allRules,
    (ruleName, value) => value === 0 && ruleName in validators
  );
  const specialRules = filterRules(
    allRules,
    (ruleName, value) => value === 0 && !(ruleName in validators)
  );

  const enabledRules = configRules
    .map(([ruleName, value, source]) => {
      const arrayValue = Array.isArray(value) ? value : [value];
      const [level, ...options] = arrayValue;
      const isOff = level === "off" || level === 0;
      return isOff ? null : { ruleName, options, source };
    })
    .filter(Boolean);

  const flaggedRules = enabledRules.filter(
    ({ ruleName }) => ruleName in allRules
  );

  const regularFlaggedRuleNames = filterRuleNames(
    flaggedRules,
    ({ ruleName }) => ruleName in regularRules
  );
  const optionsFlaggedRuleNames = filterRuleNames(
    flaggedRules,
    ({ ruleName, ...rule }) =>
      ruleName in optionsRules && !validators[ruleName](rule, enabledRules)
  );
  const specialFlaggedRuleNames = filterRuleNames(
    flaggedRules,
    ({ ruleName }) => ruleName in specialRules
  );

  if (
    regularFlaggedRuleNames.length === 0 &&
    optionsFlaggedRuleNames.length === 0
  ) {
    const baseMessage =
      "No rules that are unnecessary or conflict with Prettier were found.";

    const message =
      specialFlaggedRuleNames.length === 0
        ? baseMessage
        : [
            baseMessage,
            "",
            "However, the following rules are enabled but cannot be automatically checked. See:",
            SPECIAL_RULES_URL,
            "",
            printRuleNames(specialFlaggedRuleNames),
          ].join("\n");

    return {
      stdout: message,
      code: 0,
    };
  }

  const regularMessage = [
    "The following rules are unnecessary or might conflict with Prettier:",
    "",
    printRuleNames(regularFlaggedRuleNames),
  ].join("\n");

  const optionsMessage = [
    "The following rules are enabled with config that might conflict with Prettier. See:",
    SPECIAL_RULES_URL,
    "",
    printRuleNames(optionsFlaggedRuleNames),
  ].join("\n");

  const specialMessage = [
    "The following rules are enabled but cannot be automatically checked. See:",
    SPECIAL_RULES_URL,
    "",
    printRuleNames(specialFlaggedRuleNames),
  ].join("\n");

  const message = [
    regularFlaggedRuleNames.length === 0 ? null : regularMessage,
    optionsFlaggedRuleNames.length === 0 ? null : optionsMessage,
    specialFlaggedRuleNames.length === 0 ? null : specialMessage,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    stdout: message,
    code: 2,
  };
}

function filterRules(rules, fn) {
  return Object.entries(rules)
    .filter(([ruleName, value]) => fn(ruleName, value))
    .reduce((obj, [ruleName]) => {
      obj[ruleName] = true;
      return obj;
    }, Object.create(null));
}

function filterRuleNames(rules, fn) {
  return [
    ...new Set(rules.filter((rule) => fn(rule)).map((rule) => rule.ruleName)),
  ];
}

function printRuleNames(ruleNames) {
  return ruleNames
    .slice()
    .sort()
    .map((ruleName) => `- ${ruleName}`)
    .join("\n");
}

exports.processRules = processRules;
