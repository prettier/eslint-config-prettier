"use strict";

const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const spawn = require("cross-spawn");
const pkg = require("../package.json");
const eslintConfig = require("../.eslintrc");
const eslintConfigBase = require("../.eslintrc.base");
const getEnv = require("./helpers/get-env");

const TEST_CONFIG_DIR = "test-config";

const ruleFiles = fs
  .readdirSync(".")
  .filter(name => !name.startsWith(".") && name.endsWith(".js"));
const configFiles = fs
  .readdirSync(".")
  .filter(name => name.startsWith(".eslintrc"));

// Mock the rules modules so we can force require from source later, bypassing
// the require cache (Jest does not support Node's `require.cache` mechanism).
// Must happen before anything requires one of those files.
// e.g. `jest.requireActual(../react.js)`
ruleFiles.forEach(ruleFileName => {
  jest.mock(`../${ruleFileName}`);
});

// `beforeAll` runs before the first `test` block runs.
// Note: Code inside all `describe` blocks will run before this one.
beforeAll(() => {
  createTestConfigDir();
});

function createTestConfigDir() {
  // Clear the test config dir.
  rimraf.sync(TEST_CONFIG_DIR);
  fs.mkdirSync(TEST_CONFIG_DIR);

  // Copy all rule files into the test config dir.
  ruleFiles.forEach(ruleFileName => {
    const config = require(`../${ruleFileName}`);

    // Change all rules to "warn", so that ESLint warns about unknown rules.
    const newRules = Object.keys(config.rules).reduce((obj, ruleName) => {
      obj[ruleName] = "warn";
      return obj;
    }, {});

    const newConfig = Object.assign({}, config, { rules: newRules });

    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, ruleFileName),
      `module.exports = ${JSON.stringify(newConfig, null, 2)};`
    );
  });

  // Copy the ESLint configs into the test config dir.
  configFiles.forEach(configFileName => {
    const config = require(`../${configFileName}`);
    fs.writeFileSync(
      path.join(TEST_CONFIG_DIR, configFileName),
      `module.exports = ${JSON.stringify(config, null, 2)};`
    );
  });
}

describe("all rule files are listed in package.json", () => {
  ruleFiles.forEach(ruleFileName => {
    test(ruleFileName, () => {
      expect(pkg.files).toContain(ruleFileName);
    });
  });
});

describe("all rule files have tests in test-lint/", () => {
  ruleFiles.forEach(ruleFileName => {
    test(ruleFileName, () => {
      const testFileName =
        ruleFileName === "vue.js"
          ? "vue.vue"
          : ruleFileName === "@typescript-eslint.js"
          ? "@typescript-eslint.ts"
          : ruleFileName;
      expect(fs.existsSync(path.join("test-lint", testFileName))).toBe(true);
    });
  });
});

describe("all rule files are included in the ESLint config", () => {
  ruleFiles.forEach(ruleFileName => {
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
  const readme = fs.readFileSync("README.md", "utf8");
  ruleFiles
    .filter(ruleFileName => ruleFileName !== "index.js")
    .forEach(ruleFileName => {
      test(ruleFileName, () => {
        const name = ruleFileName.replace(/\.js$/, "");
        expect(readme).toMatch(
          name.startsWith("@") ? name : `eslint-plugin-${name}`
        );
        expect(readme).toMatch(`"${name}"`);
        expect(readme).toMatch(`"prettier/${name}"`);
      });
    });
});

describe("all special rules are mentioned in the README", () => {
  const readme = fs.readFileSync("README.md", "utf8");
  const specialRuleNames = [].concat(
    ...ruleFiles.map(ruleFileName => {
      const rules = require(`../${ruleFileName}`).rules;
      return Object.keys(rules).filter(name => rules[name] === 0);
    })
  );

  specialRuleNames.forEach(name => {
    test(name, () => {
      expect(readme).toMatch(name);
    });
  });
});

describe('all rules are set to "off" or 0', () => {
  const allRules = Object.assign(
    Object.create(null),
    ...ruleFiles.map(ruleFileName => require(`../${ruleFileName}`).rules)
  );

  Object.keys(allRules).forEach(name => {
    const value = allRules[name];

    test(name, () => {
      expect(value === "off" || value === 0).toBe(true);
    });
  });
});

test("there are no unknown rules", () => {
  const result = spawn.sync("npm", ["run", "test:lint-rules", "--silent"], {
    encoding: "utf8",
    env: getEnv()
  });
  const output = JSON.parse(result.stdout);

  output[0].messages.forEach(message => {
    expect(message.message).not.toMatch(/rule\s+'[^']+'.*not found/);
  });
});

describe("support omitting all deprecated rules", () => {
  const deprecatedRulesMap = {
    index: ["indent-legacy", "no-spaced-func"],
    react: ["react/jsx-space-before-closing"]
  };

  process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED = 1;

  Object.keys(deprecatedRulesMap).forEach(ruleFileName => {
    // Force require from source, otherwise we'll get the cached module
    const { rules } = jest.requireActual(`../${ruleFileName}`);

    test(`${ruleFileName} config has no deprecated rules`, () => {
      deprecatedRulesMap[ruleFileName].forEach(deprecatedRuleName => {
        expect(rules[deprecatedRuleName]).not.toBeDefined();
      });
    });
  });

  delete process.env.ESLINT_CONFIG_PRETTIER_NO_DEPRECATED;
});
