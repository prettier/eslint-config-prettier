"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const config = require("../");
const eslintConfig = require("../.eslintrc");
const eslintConfigBase = require("../.eslintrc.base");

const ROOT = path.join(__dirname, "..");
const TEST_CONFIG_DIR = path.join(ROOT, "test-config");

const plugins = [
  ...new Set(
    Object.keys(config.rules).map((ruleName) => {
      const parts = ruleName.split("/");
      return parts.length > 1 ? parts[0] : "core";
    })
  ),
];

function parseJson(result) {
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new SyntaxError(
      `
${error.message}

### stdout
${result.stdout}

### stderr
${result.stderr}
`.trimStart()
    );
  }
}

beforeAll(() => {
  createTestConfigDir();
});

function createTestConfigDir() {
  fs.rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEST_CONFIG_DIR);

  // Change all rules to "warn", so that ESLint warns about unknown rules.
  const newRules = Object.fromEntries(
    Object.entries(config.rules).map(([ruleName]) => [ruleName, "warn"])
  );

  const newConfig = { ...config, rules: newRules };

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, "index.js"),
    `module.exports = ${JSON.stringify(newConfig, null, 2)};`
  );

  fs.copyFileSync(
    path.join(ROOT, "prettier.js"),
    path.join(TEST_CONFIG_DIR, "prettier.js")
  );

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, ".eslintrc.js"),
    `module.exports = ${JSON.stringify(eslintConfig, null, 2)};`
  );

  fs.writeFileSync(
    path.join(TEST_CONFIG_DIR, ".eslintrc.base.js"),
    `module.exports = ${JSON.stringify(eslintConfigBase, null, 2)};`
  );
}

describe("all plugins have tests in test-lint/", () => {
  plugins.forEach((plugin) => {
    test(plugin, () => {
      const testFileName =
        plugin === "vue"
          ? "vue.vue"
          : plugin === "@typescript-eslint"
          ? `${plugin}.ts`
          : `${plugin}.js`;
      expect(fs.existsSync(path.join(ROOT, "test-lint", testFileName))).toBe(
        true
      );
    });
  });
});

describe("all plugins are mentioned in the README", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  plugins
    .filter((plugin) => plugin !== "core")
    .forEach((plugin) => {
      test(plugin, () => {
        expect(readme).toMatch(
          plugin.startsWith("@") ? plugin : `eslint-plugin-${plugin}`
        );
      });
    });
});

describe("all special rules are mentioned in the README", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const specialRuleNames = Object.keys(config.rules).filter(
    (name) => config.rules[name] === 0
  );

  specialRuleNames.forEach((name) => {
    test(name, () => {
      expect(readme).toMatch(name);
    });
  });
});

describe('all rules are set to "off" or 0', () => {
  Object.entries(config.rules).forEach(([name, value]) => {
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
  const output = parseJson(result);

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
