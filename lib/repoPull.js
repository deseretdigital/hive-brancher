const git = require("simple-git")(__dirname);
const Promise = require("bluebird");
const log = require("./log");

function repoPull({ owner, repo }, repoPath) {
  return new Promise((resolve, reject) => {
    log(`[${owner}/${repo}]: Pull from origin`);
    try {
      git
        .cwd(repoPath)
        .fetch()
        .reset("hard")
        .clean("f", { "-d": null, "-x": "" })
        .checkout("master")
        .pull()
        .then(err => (err ? reject(err) : resolve()));
    } catch (e) {
      log(`[${owner}/${repo}]: Error pulling from origin in ${repoPath}`);
      reject(e);
    }
  });
}

module.exports = repoPull;
