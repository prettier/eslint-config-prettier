"use strict";

module.exports = function getEnv() {
  // this is required to address an issue in cross-spawn on windows
  // https://github.com/IndigoUnited/node-cross-spawn/issues/80
  return Object.keys(process.env)
    .filter(key => process.env[key] !== undefined)
    .reduce((envCopy, key) => {
      envCopy[key] = process.env[key];
      return envCopy;
    }, {});
};
