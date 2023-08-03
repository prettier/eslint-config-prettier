"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const testLintFiles = fs
  .readdirSync(path.join(__dirname, "..", "test-lint"))
  .filter(
    (name) =>
      !name.startsWith(".") &&
      // Have not managed to get flowtype running in flat config yet.
      (process.env.ESLINT_USE_FLAT_CONFIG === "false" || name !== "flowtype.js")
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
      process.env.ESLINT_USE_FLAT_CONFIG === "false"
        ? "test:lint-verify-fail"
        : "test:lint-verify-fail:flat",
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
      .replace(/\.(?:js|ts)$|-file\.vue$/, "");
    const ruleIds = data.messages.map((message) => message.ruleId);

    describe(name, () => {
      test("has errors", () => {
        expect(ruleIds.length).toBeGreaterThan(0);
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
