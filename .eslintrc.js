"use strict";

const pkg = require("./package.json");

module.exports = {
  extends: ["./.eslintrc.base.js"].concat(
    pkg.files
      .filter(name => name.indexOf("/") === -1)
      .map(ruleFileName => `./${ruleFileName}`)
  )
};
