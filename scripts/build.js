"use strict";

const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..");
const BUILD = path.join(DIR, "build");

const READ_MORE =
  "**[➡️ Full readme](https://github.com/prettier/eslint-config-prettier/)**";

const FILES_TO_COPY = [
  { src: "LICENSE" },
  { src: "package-real.json", dest: "package.json" },
  {
    src: "README.md",
    transform: (content) => content.replace(/^---[^]*/m, READ_MORE),
  },
  { src: "index.js" },
  { src: "prettier.js" },
  ...fs
    .readdirSync(path.join(DIR, "bin"))
    .filter((file) => !file.startsWith(".") && file.endsWith(".js"))
    .map((file) => ({ src: path.join("bin", file) })),
];

if (fs.existsSync(BUILD)) {
  fs.rmdirSync(BUILD, { recursive: true });
}

fs.mkdirSync(BUILD);

for (const { src, dest = src, transform } of FILES_TO_COPY) {
  if (transform) {
    fs.writeFileSync(
      path.join(BUILD, dest),
      transform(fs.readFileSync(path.join(DIR, src), "utf8"))
    );
  } else {
    fs.mkdirSync(path.dirname(path.join(BUILD, dest)), { recursive: true });
    fs.copyFileSync(path.join(DIR, src), path.join(BUILD, dest));
  }
}

const LEGACY_CONFIGS = [
  "@typescript-eslint",
  "babel",
  "flowtype",
  "react",
  "standard",
  "unicorn",
  "vue",
];

function legacyConfigStub(name) {
  return `
throw new Error(
  '"prettier/${name}" has been merged into "prettier" in eslint-config-prettier 8.0.0. See: https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21'
);
  `.trim();
}

for (const name of LEGACY_CONFIGS) {
  fs.writeFileSync(path.join(BUILD, `${name}.js`), legacyConfigStub(name));
}
