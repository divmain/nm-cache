# nm-cache

Have you ever been in the situation where someone asks you to `git checkout` their branch, and you hesitate?

If you have, and if it is because you're not interested in helping others, this package won't be of use to you.  You're probably a jerk, and that's not a software problem.

However, if you hesitate because your project's dependencies change often, and `npm install` takes forever, `nm-cache` might be able to help!

The project may also be of use if you need to test a project between multiple versions of Node.  If you use something like [nodenv](https://github.com/nodenv/nodenv) or [nvm](https://github.com/creationix/nvm), you'll need to globally install `nm-cache` for each Node version, but there should be no other constraints.


## Use

- `npm install -g nm-cache`
- Enjoy!

**Note:** `nm-cache` requires a POSIX-compatible environment to work.  OSX and most Linux flavors should work out-of-the-box.  Windows 10 with its new Ubuntu mode might work too, although it hasn't been tested.


## Common workflow

Let's say you want to checkout someone else's branch, but you don't want to wait forever.  Here's what you would do:

```bash
nm-cache save
git checkout other-branch
nm-cache restore || (npm install && nm-cache save)

# Do all the things...

git checkout original-branch
nm-cache restore
```

Or maybe your `project.json` changes relatively often, but you don't want to check it manually every time you pull down the latest `master`:

```bash
git pull origin master
git diff-tree -r --name-only --no-commit-id HEAD@{1} HEAD | \
    grep --quiet "package.json" && \
    npm install && \
    nm-cache save
```

If you want this to be automated, make it into a `post-merge` [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks#Client-Side-Hooks).


## Options

```
Usage: nm-cache <command> [options]

  This utility helps you stash particular versions of your node_modules
  directories with minimal overhead.  Later you can restore them.

  This can be useful when, for example, you switch between branches that have
  different dependencies or versions, or if you need to switch between Node
  run-time versions.

Commands:
  save     Save a snapshot of your current node_modules.
  restore  Restore a saved snapshot, anchored to package.json
  check    Exit with 0 if already cached, exit with 1 otherwise.

Options:
  --package-json  `package.json` to use as node_modules anchor point (optional).
  --force         Overwrite pre-existing node_modules cache (optional).
  --hash          Indicates which cached directory to restore (optional).
  --help          Show help                                            [boolean]
```


## Under the Hood

You may notice that `nm-cache` is relatively quick about its business.  This is because it does _not_ make copies of your `node_modules` subdirectories.  Instead, it creates a directory structure that matches your existing `node_modules` and hard-links the files.

One side benefit of this approach is that there will only ever be one physical copy of each snapshot stored on disk, including the `node_modules` directory itself.  Of course, multiple snapshots with partially-identical contents will not be de-duplicated, as that would require some tight integration with `npm` or a heavy hash-every-file approach like `git`.

You may also notice that `nm-cache` doesn't require that you specify any unique identifier for your snapshot.  This is because, by default, it will create a hash of your `package.json` file and use this to uniquely identify the snapshot when they're saved.

Similarly, when you're restoring, it'll hash your `package.json` and look to see whether a snapshot has already been made.  If so, you won't have to `npm install` again!
