#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const co = require("co");
const yargs = require("yargs");

const { exists, exec } = require("./helpers");
const init = require("./init");
const save = require("./save");
const check = require("./check");
const restore = require("./restore");
const install = require("./install");


const getPackageJson = fpath => fpath ?
  path.resolve(process.cwd(), fpath) :
  path.join(process.cwd(), "package.json");

const getHash = co.wrap(function* (fpath) {
  if (!(yield exists(fpath))) {
    throw new Error("The specified package.json file does not exist:", fpath);
  }

  const { stdout } = yield exec(`shasum -a 256 "${fpath}"`);
  return stdout.split(" ")[0];
});

const wrap = genFn => co(genFn).catch(err => {
  console.error(`\x1b[31mERROR: ${err}\x1b[0m\n`);
  process.exit(1);
});


yargs
  .strict()
  .usage(`Usage: nm-cache <command> [options]

  This utility helps you stash particular versions of your node_modules
  directories with minimal overhead.  Later you can restore them.

  This can be useful when, for example, you switch between branches that have
  different dependencies or versions, or if you need to switch between Node
  run-time versions.`)
  .option("package-json", {
    describe: "`package.json` to use as node_modules anchor point (optional)."
  })
  .option("force", {
    describe: "Overwrite pre-existing node_modules cache (optional)."
  })
  .option("hash", {
    describe: "Indicates which cached directory to restore (optional)."
  })
  .command("save", "Save a snapshot of your current node_modules.", ({ argv: { packageJson, force } }) => {
    wrap(function* () {
      yield init();
      packageJson = getPackageJson(packageJson);
      const hash = yield getHash(packageJson);
      yield save(path.dirname(packageJson), hash, force);
    });
  })
  .command("restore", "Restore a saved snapshot, anchored to package.json", ({ argv: { packageJson } }) => {
    wrap(function* () {
      yield init();
      packageJson = getPackageJson(packageJson);
      const hash = yield getHash(packageJson);
      yield restore(path.dirname(packageJson), hash);
    });
  })
  .command("check", "Exit with 0 if already cached, exit with 1 otherwise.", ({ argv: { packageJson } }) => {
    wrap(function* () {
      yield init();
      packageJson = getPackageJson(packageJson);
      const hash = yield getHash(packageJson);
      yield check(hash);
    });
  })
  .demand(1, "You must provide a sub-command.")
  .epilogue("For more info or to report an issue, visit the following URL:\nhttp://github.com/divmain/nm-cache")
  .help("help")
  .parse(process.argv);
