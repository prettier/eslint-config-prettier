"use strict";

const test = require("ava");
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const pkg = require("../package.json");

const TEST_CONFIG_DIR = "test-config";

function getRuleFiles() {
  return fs
    .readdirSync(".")
    .filter(name => !name.startsWith(".") && name.endsWith(".js"));
}

function getConfigFiles() {
  return fs.readdirSync(".").filter(name => name.startsWith(".eslintrc"));
}

function createTestConfigDir(ruleFiles, configFiles) {
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

  // Copy the ESLint configs into the test config dir.
  configFiles.forEach(configFileName => {
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, configFileName),
      fs.readFileSync(configFileName)
    );
  });
}

test("All rule files are listed in package.json", t => {
  const ruleFiles = getRuleFiles();

  ruleFiles.forEach(ruleFileName => {
    t.true(pkg.files.indexOf(ruleFileName) >= 0);
  });
});

test("All rule files have tests in test-lint/", t => {
  const ruleFiles = getRuleFiles();

  ruleFiles.forEach(ruleFileName => {
    t.true(fs.existsSync(path.join("test-lint", ruleFileName)));
  });
});

test("There are no unknown rules", t => {
  const ruleFiles = getRuleFiles();
  const configFiles = getConfigFiles();

  createTestConfigDir(ruleFiles, configFiles);

  const result = childProcess.spawnSync(
    "npm",
    ["run", "test:lint-rules", "--silent"],
    { encoding: "utf8" }
  );
  const output = JSON.parse(result.stdout);
  const messages = output[0].messages.slice(0, 3);

  messages.forEach(message => {
    t.notRegex(message.message, /rule\s+'[^']+'.*not found/);
  });
});
