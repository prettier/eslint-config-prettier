"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const useEslintrc = process.env.ESLINT_USE_FLAT_CONFIG === "false";

const testLintFiles = fs
  .readdirSync(path.join(__dirname, "..", "test-lint"))
  .filter(
    (name) =>
      !name.startsWith(".") &&
      // TODO: Figure out how to get flowtype running in flat config.
      (useEslintrc || name !== "flowtype.js")
  );

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

describe("test-lint/ causes errors without eslint-config-prettier", () => {
  const result = childProcess.spawnSync(
    "npm",
    [
      "run",
      useEslintrc ? "test:lint-verify-fail" : "test:lint-verify-fail:flat",
      "--silent",
    ],
    { encoding: "utf8", shell: true }
  );
  const output = parseJson(result);

  test("every test-lint/ file must cause an error", () => {
    expect(output.length).toBe(testLintFiles.length);
  });

  output.forEach((data) => {
    const name = path
      .basename(data.filePath)
      .replace(/\.(?:js|jsx|ts)$|-file\.vue$/, "");

    // Ignore messages that are not related to rules, for example: `Unused eslint-disable directive` which are expected
    const ruleIds = data.messages.flatMap((message) => message.ruleId || []);

    // The following are ESM only without eslintrc supported now
    if (
      useEslintrc &&
      [
        "@stylistic",
        "@stylistic__js",
        "@stylistic__jsx",
        "@stylistic__ts",
        "unicorn",
      ].includes(name)
    ) {
      return;
    }

    describe(name, () => {
      test("has errors", () => {
        // The following has no stylistic rules now, so it should not cause any errors
        if (
          ["@typescript-eslint"]
            .concat(useEslintrc ? [] : "core")
            .includes(name)
        ) {
          expect(ruleIds.length).toBe(0);
        } else {
          expect(ruleIds.length).toBeGreaterThan(0);
        }
      });

      test("must only cause errors related to itself", () => {
        // ESLint core rules have no prefix.
        // eslint-plugin-prettier provides no conflicting rules, but makes two
        // core rules unusable.
        if (name === "core" || name === "prettier") {
          expect(
            ruleIds
              .filter((ruleId) => ruleId.includes("/"))
              .concat("no ruleId should not contain a slash")
          ).toEqual(["no ruleId should not contain a slash"]);
        } else if (name.startsWith("@stylistic__")) {
          const stylisticGroup = name.split("__")[1];
          const rulePrefix = `@stylistic/${stylisticGroup}/`;
          expect(
            ruleIds
              .filter((ruleId) => !ruleId.startsWith(rulePrefix))
              .concat(`every ruleId should start with: ${rulePrefix}`)
          ).toEqual([`every ruleId should start with: ${rulePrefix}`]);
        } else {
          expect(
            ruleIds
              .filter((ruleId) => !ruleId.startsWith(`${name}/`))
              .concat(`every ruleId should start with: ${name}/`)
          ).toEqual([`every ruleId should start with: ${name}/`]);
        }
      });
    });
  });
});
