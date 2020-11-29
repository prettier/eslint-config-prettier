"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const ruleFiles = fs
  .readdirSync(".")
  .filter((name) => !name.startsWith(".") && name.endsWith(".js"));

describe("test-lint/ causes errors without eslint-config-prettier", () => {
  const result = childProcess.spawnSync(
    "npm",
    ["run", "test:lint-verify-fail", "--silent"],
    { encoding: "utf8", shell: true }
  );
  const output = JSON.parse(result.stdout);

  test("every test-lint/ file must cause an error", () => {
    expect(output.length).toBe(ruleFiles.length);
  });

  output.forEach((data) => {
    const name = path.basename(data.filePath).replace(/\.(?:js|ts|vue)$/, "");
    const ruleIds = data.messages.map((message) => message.ruleId);

    describe(name, () => {
      test("has errors", () => {
        expect(ruleIds.length).toBeGreaterThan(0);
      });

      test("must only cause errors related to itself", () => {
        if (name === "index") {
          expect(ruleIds.every((ruleId) => !ruleId.includes("/"))).toBe(true);
        } else {
          expect(ruleIds.every((ruleId) => ruleId.startsWith(`${name}/`))).toBe(
            true
          );
        }
      });
    });
  });
});
