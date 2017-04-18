#!/usr/bin/env node

"use strict";

const getStdin = require("get-stdin");
const pkg = require("../package.json");

if (module === require.main) {
  if (process.argv.length > 2 || process.stdin.isTTY) {
    console.error(
      [
        "This tool checks whether an ESLint configuration contains rules that are",
        "unnecessary or conflict with Prettier. It’s supposed to be run like this:",
        "",
        "  eslint --print-config .eslintrc.js | eslint-config-prettier-check",
        "",
        "(Swap out .eslintrc.js with the path to your config if needed.)",
        "",
        "Exit codes:",
        "",
        "0: No problems found.",
        "1: Unexpected error.",
        "2: Conflicting rules found.",
        "3: Special rules only found.",
        "",
        "For more information, see:",
        "https://github.com/prettier/eslint-config-prettier#cli-helper-tool"
      ].join("\n")
    );
    process.exit(1);
  }

  getStdin()
    .then(string => {
      const result = processString(string);
      if (result.stderr) {
        console.error(result.stderr);
      }
      if (result.stdout) {
        console.error(result.stdout);
      }
      process.exit(result.code);
    })
    .catch(error => {
      console.error("Unexpected error", error);
      process.exit(1);
    });
}

function processString(string) {
  let config;
  try {
    config = JSON.parse(string);
  } catch (error) {
    return {
      stderr: `Failed to parse JSON:\n${error.message}`,
      code: 1
    };
  }

  if (
    !(Object.prototype.toString.call(config) === "[object Object]" &&
      Object.prototype.toString.call(config.rules) === "[object Object]")
  ) {
    return {
      stderr: `Expected a \`{"rules: {...}"}\` JSON object, but got:\n${string}`,
      code: 1
    };
  }

  const allRules = Object.assign.apply(
    Object,
    [Object.create(null)].concat(
      pkg.files
        .filter(name => name.indexOf("/") === -1)
        .map(ruleFileName => require(`../${ruleFileName}`).rules)
    )
  );

  const specialRules = Object.keys(allRules)
    .filter(ruleName => allRules[ruleName] === 0)
    .reduce((obj, ruleName) => {
      obj[ruleName] = true;
      return obj;
    }, Object.create(null));

  const flaggedRuleNames = Object.keys(config.rules).filter(ruleName => {
    const value = config.rules[ruleName];
    const level = Array.isArray(value) ? value[0] : value;
    const isOff = level === "off" || level === 0;
    return !isOff && ruleName in allRules;
  });

  if (flaggedRuleNames.length === 0) {
    return {
      stdout: "No rules that are unnecessary or conflict with Prettier were found.",
      code: 0
    };
  }

  const regularRulesList = flaggedRuleNames
    .filter(ruleName => !(ruleName in specialRules))
    .sort()
    .map(ruleName => `- ${ruleName}`)
    .join("\n");

  const specialRulesList = flaggedRuleNames
    .filter(ruleName => ruleName in specialRules)
    .sort()
    .map(ruleName => `- ${ruleName}`)
    .join("\n");

  const regularMessage = [
    "The following rules are unnecessary or might conflict with Prettier:",
    "",
    regularRulesList
  ].join("\n");

  const specialMessage = [
    "The following rules are enabled but can only be enabled in some cases.",
    "It is up to you to check if they are configured correctly. See:",
    "https://github.com/prettier/eslint-config-prettier#special-rules",
    "",
    specialRulesList
  ].join("\n");

  const message = [
    regularRulesList.length === 0 ? null : regularMessage,
    specialRulesList.length === 0 ? null : specialMessage
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    stdout: message,
    code: regularRulesList.length > 0 ? 2 : 3
  };
}

exports.processString = processString;
