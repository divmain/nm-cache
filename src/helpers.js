const cp = require("child_process");
const fs = require("fs");


const fromCallback = fn => new Promise((resolve, reject) => {
  fn((error, result) => error
    ? reject(error)
    : resolve(result)
  );
});

const exists = fpath => fromCallback(cb => fs.access(fpath, cb))
  .then(() => true)
  .catch(() => false);

const mkdir = fpath => fromCallback(cb => fs.mkdir(fpath, cb));

const exec = (command, cwd) => new Promise((resolve, reject) => {
  const opts = cwd ?
    { cwd } :
    {};

  cp.exec(command, opts, (err, stdout, stderr) => {
    return err ?
      reject(new Error(`${err} - ${stdout}`)) :
      resolve({ stdout, stderr });
  });
});

const readFile = fpath => fromCallback(cb => fs.readfile(fpath, cb));

module.exports = { fromCallback, exists, mkdir, exec, readFile };
