"use strict";

const test = require("ava");
const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const getEnv = require("./helpers/get-env");

const ruleFiles = fs
  .readdirSync(".")
  .filter(name => !name.startsWith(".") && name.endsWith(".js"));

test("test-lint/ causes errors without eslint-config-prettier", t => {
  const result = spawn.sync(
    "npm",
    ["run", "test:lint-verify-fail", "--silent"],
    { encoding: "utf8", env: getEnv() }
  );
  const output = JSON.parse(result.stdout);

  t.is(
    output.length,
    ruleFiles.length,
    "every test-lint/ file must cause an error"
  );

  output.forEach(data => {
    const name = path.basename(data.filePath).replace(/\.js$/, "");
    const ruleIds = data.messages.map(message => message.ruleId);

    t.true(name && ruleIds.length > 0);

    // Every test-lint/ file must only cause errors related to its purpose.
    if (name === "index") {
      t.true(ruleIds.every(ruleId => ruleId.indexOf("/") === -1));
    } else {
      t.true(ruleIds.every(ruleId => ruleId.startsWith(`${name}/`)));
    }
  });
});
