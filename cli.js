#!/usr/bin/env node

"use strict";

const getStdin = require("get-stdin");
const coreRules = require("./rules/core");
const reactRules = require("./rules/react");

if (process.argv.length > 2 || process.stdin.isTTY) {
  console.error(
    [
      "This tool checks whether an ESLint configuration contains rules that are",
      "unnecessary or conflict with prettier. It’s supposed to be run like this:",
      "",
      "  eslint --print-config .eslintrc.js | eslint-config-prettier-check",
      "",
      "(Swap out .eslintrc.js with the path to your config if needed.)",
      "",
      "For more information, see:",
      "https://github.com/lydell/eslint-config-prettier#cli-helper-tool"
    ].join("\n")
  );
  process.exit(1);
}

getStdin().then(processString).catch(error => {
  console.error("Unexpected error", error);
  process.exit(1);
});

function processString(string) {
  let config;
  try {
    config = JSON.parse(string);
  } catch (error) {
    console.error(`Failed to parse JSON:\n${error.message}`);
    process.exit(1);
  }

  const allRules = Object.assign(
    Object.create(null),
    coreRules.rules,
    reactRules.rules
  );

  const specialRules = Object
    .keys(allRules)
    .filter(ruleName => allRules[ruleName] === 0)
    .reduce(
      (obj, ruleName) => {
        obj[ruleName] = true;
        return obj;
      },
      Object.create(null)
    );

  const configRules = config.rules || {};

  const flaggedRuleNames = Object.keys(configRules).filter(ruleName => {
    const value = configRules[ruleName];
    const level = Array.isArray(value) ? value[0] : value;
    const isOff = level === "off" || level === 0;
    return !isOff && ruleName in allRules;
  });

  if (flaggedRuleNames.length === 0) {
    console.log(
      "No rules that are unnecessary or conflict with prettier were found."
    );
    process.exit(0);
  }

  const regularRulesList = flaggedRuleNames
    .filter(ruleName => !(ruleName in specialRules))
    .map(ruleName => `- ${ruleName}`)
    .join("\n");

  const specialRulesList = flaggedRuleNames
    .filter(ruleName => ruleName in specialRules)
    .map(ruleName => `- ${ruleName}`)
    .join("\n");

  const regularMessage = [
    "The following rules are unnecessary or might conflict with prettier:",
    "",
    regularRulesList
  ].join("\n");

  const specialMessage = [
    "The following rules can be enabled in some cases. See:",
    "https://github.com/lydell/eslint-config-prettier#exceptions",
    "",
    specialRulesList
  ].join("\n");

  const message = [
    regularRulesList.length === 0 ? null : regularMessage,
    specialRulesList.length === 0 ? null : specialMessage
  ]
    .filter(Boolean)
    .join("\n\n");

  console.warn(message);
  process.exit(2);
}
