const co = require("co");

const { cacheDir } = require("./config");
const { exists, mkdir } = require("./helpers");


module.exports = co.wrap(function*() {
  const cacheDirExists = yield exists(cacheDir);

  if (!cacheDirExists) {
    yield mkdir(cacheDir);
  }
});
