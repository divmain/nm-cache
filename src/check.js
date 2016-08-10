const path = require("path");

const co = require("co");

const { cacheDir } = require("./config");
const { exists, mkdir, exec } = require("./helpers");


module.exports = co.wrap(function*(hash) {
  const cachePath = path.join(cacheDir, hash);
  const cachePathExists = yield exists(cachePath);

  if (!cachePathExists) {
    throw new Error("Current node_modules is not cached.");
  }
});
