const path = require("path");

const co = require("co");

const { cacheDir } = require("./config");
const { exists, mkdir, exec } = require("./helpers");


module.exports = co.wrap(function*(basePath, hash, force) {
  const cachePath = path.join(cacheDir, hash);
  const cachePathExists = yield exists(cachePath);

  if (cachePathExists) {
    if (!force) {
      throw new Error("Cache conflict.  Use --force to override.");
    } else {
      console.log("Removing existing cache...");
      yield exec(`rm -fr "${cachePath}"`);
    }
  }
  yield mkdir(cachePath);

  const nmPath = path.join(basePath, "node_modules");

  console.log(`Caching node_modules as ${hash}...`);
  yield exec(`pax -rwlpe ./* "${cachePath}/"`, nmPath);
  console.log("Done!");
});
