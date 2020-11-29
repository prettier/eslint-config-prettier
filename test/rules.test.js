"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const pkg = require("../package.json");
const eslintConfig = require("../.eslintrc");
const eslintConfigBase = require("../.eslintrc.base");

const ROOT = path.join(__dirname, "..");
const TEST_CONFIG_DIR = path.join(ROOT, "test-config");

const ruleFiles = fs
  .readdirSync(ROOT)
  .filter((name) => !name.startsWith(".") && name.endsWith(".js"));
const configFiles = fs
  .readdirSync(ROOT)
  .filter((name) => name.startsWith(".eslintrc"));

beforeAll(() => {
  createTestConfigDir();
});

function createTestConfigDir() {
  // Clear the test config dir.
  rimraf.sync(TEST_CONFIG_DIR);
  fs.mkdirSync(TEST_CONFIG_DIR);

  // Copy all rule files into the test config dir.
  ruleFiles.forEach((ruleFileName) => {
    const config = require(`../${ruleFileName}`);

    // Change all rules to "warn", so that ESLint warns about unknown rules.
    const newRules = Object.keys(config.rules).reduce((obj, ruleName) => {
      obj[ruleName] = "warn";
      return obj;
    }, {});

    const newConfig = { ...config, rules: newRules };

    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, ruleFileName),
      `module.exports = ${JSON.stringify(newConfig, null, 2)};`
    );
  });

  // Copy the ESLint configs into the test config dir.
  configFiles.forEach((configFileName) => {
    const config = require(`../${configFileName}`);
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, configFileName),
      `module.exports = ${JSON.stringify(config, null, 2)};`
    );
  });
}

describe("all rule files are listed in package.json", () => {
  ruleFiles.forEach((ruleFileName) => {
    test(ruleFileName, () => {
      expect(pkg.files).toContain(ruleFileName);
    });
  });
});

describe("all rule files have tests in test-lint/", () => {
  ruleFiles.forEach((ruleFileName) => {
    test(ruleFileName, () => {
      const testFileName =
        ruleFileName === "vue.js"
          ? "vue.vue"
          : ruleFileName === "@typescript-eslint.js"
          ? "@typescript-eslint.ts"
          : ruleFileName;
      expect(fs.existsSync(path.join(ROOT, "test-lint", testFileName))).toBe(
        true
      );
    });
  });
});

describe("all rule files are included in the ESLint config", () => {
  ruleFiles.forEach((ruleFileName) => {
    test(ruleFileName, () => {
      const name = ruleFileName.replace(/\.js$/, "");
      expect(eslintConfig.extends).toContain(`./${ruleFileName}`);
      if (ruleFileName !== "index.js") {
        expect(eslintConfigBase.plugins).toContain(name);
      }
    });
  });
});

describe("all plugin rule files are mentioned in the README", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  ruleFiles
    .filter((ruleFileName) => ruleFileName !== "index.js")
    .forEach((ruleFileName) => {
      test(ruleFileName, () => {
        const name = ruleFileName.replace(/\.js$/, "");
        expect(readme).toMatch(
          name.startsWith("@") ? name : `eslint-plugin-${name}`
        );
        expect(readme).toMatch(`"prettier/${name}"`);
      });
    });
});

describe("all special rules are mentioned in the README", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const specialRuleNames = [].concat(
    ...ruleFiles.map((ruleFileName) => {
      const rules = require(`../${ruleFileName}`).rules;
      return Object.keys(rules).filter((name) => rules[name] === 0);
    })
  );

  specialRuleNames.forEach((name) => {
    test(name, () => {
      expect(readme).toMatch(name);
    });
  });
});

describe('all rules are set to "off" or 0', () => {
  const allRules = Object.assign(
    Object.create(null),
    ...ruleFiles.map((ruleFileName) => require(`../${ruleFileName}`).rules)
  );

  Object.keys(allRules).forEach((name) => {
    const value = allRules[name];

    test(name, () => {
      expect(value === "off" || value === 0).toBe(true);
    });
  });
});

test("there are no unknown rules", () => {
  const result = childProcess.spawnSync(
    "npm",
    ["run", "test:lint-rules", "--silent"],
    { encoding: "utf8", shell: true }
  );
  const output = JSON.parse(result.stdout);

  output[0].messages.forEach((message) => {
    expect(message.message).not.toMatch(/rule\s+'[^']+'.*not found/);
  });
});

test("support omitting all deprecated rules", () => {
  const run = (env = {}) =>
    childProcess.spawnSync("npm", ["run", "test:deprecated"], {
      encoding: "utf8",
      shell: true,
      env: {
        ...process.env,
        ...env,
      },
    });

  const result1 = run();
  const result2 = run({
    ESLINT_CONFIG_PRETTIER_NO_DEPRECATED: "true",
  });

  expect(result1.status).not.toBe(0);
  expect(result2.status).toBe(0);
});
