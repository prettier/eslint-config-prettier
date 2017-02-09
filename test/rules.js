"use strict";

const test = require("ava");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const pkg = require("../package.json");

const CONFIG_FILE_NAME = ".eslintrc.js";
const TEST_CONFIG_DIR = "test-config";

function getRuleFiles() {
  return fs
    .readdirSync(".")
    .filter(name => !name.startsWith(".") && name.endsWith(".js"));
}

function createTestConfigDir(ruleFiles) {
  // Clear the test config dir.
  rimraf.sync(TEST_CONFIG_DIR);
  fs.mkdirSync(TEST_CONFIG_DIR);

  // Copy all rule files into the test config dir.
  ruleFiles.forEach(ruleFileName => {
    const config = require(`../${ruleFileName}`);

    // Change all rules to "warn", so that ESLint warns about unknown rules.
    Object.keys(config.rules).forEach(ruleName => {
      config.rules[ruleName] = "warn";
    });

    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, ruleFileName),
      `module.exports = ${JSON.stringify(config, null, 2)};`
    );
  });

  // Copy the ESLint config into the test config dir.
  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, CONFIG_FILE_NAME),
    fs.readFileSync(CONFIG_FILE_NAME)
  );
}

test("All rule files are listed in package.json", t => {
  const ruleFiles = getRuleFiles();

  ruleFiles.forEach(ruleFileName => {
    t.true(pkg.files.includes(ruleFileName));
  });
});

test("There are no unknown rules", t => {
  const ruleFiles = getRuleFiles();

  createTestConfigDir(ruleFiles);

  const result = childProcess.spawnSync(
    "npm",
    ["run", "test:lint", "--silent"],
    { encoding: "utf8" }
  );
  const output = JSON.parse(result.stdout);
  const messages = output[0].messages.slice(0, 3);

  messages.forEach(message => {
    t.notRegex(message.message, /rule\s+'[^']+'.*not found/);
  });
});
