const path = require("path");

const co = require("co");

const { cacheDir } = require("./config");
const { exists, mkdir, exec } = require("./helpers");


module.exports = co.wrap(function*(basePath, hash) {
  const cachePath = path.join(cacheDir, hash);
  const cachePathExists = yield exists(cachePath);

  if (!cachePathExists) {
    throw new Error(`Non-existent cache for: ${hash}`);
  }

  const nmPath = path.join(basePath, "node_modules");
  const nmPathExists = yield exists(nmPath);

  if (nmPathExists) {
    console.log("Removing existing node_modules...");
    yield exec(`rm -fr "${nmPath}"`);
  }
  yield mkdir(nmPath);

  console.log(`Restoring node_modules from ${hash}...`);
  yield exec(`pax -rwlpe ./* "${nmPath}/"`, cachePath);
  console.log("Done!");
});
