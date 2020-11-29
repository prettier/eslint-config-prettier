"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ruleFiles = fs
  .readdirSync(ROOT)
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
