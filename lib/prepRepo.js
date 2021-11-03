const fs = require("fs");
const Promise = require("bluebird");
const git = require("simple-git")(__dirname);

const repoPull = require("./repoPull");
const log = require("./log");

function prepRepo(config, buildPath) {
  const { repo, owner, user, token } = config;
  const repoPath = `${buildPath}/base_${repo}`;
  return new Promise((resolve, reject) => {
    log(`[${owner}/${repo}]: Prep repository and base directory`);
    if (!fs.accessSync(buildPath, fs.constants.F_OK)) {
      fs.mkdirSync(buildPath);
    }
    if (!fs.accessSync(repoPath, fs.constants.F_OK)) {
      git
        .clone(`https://${user}:${token}@github.com/${owner}/${repo}`, repoPath)
        .then(err => {
          if (err) {
            return reject(err);
          }
          repoPull(config, repoPath).then(() =>
            resolve(Object.assign({}, config, { repoPath }))
          );
        });
    } else {
      repoPull(config, repoPath).then(() =>
        resolve(Object.assign({}, config, { repoPath }))
      );
    }
  });
}

module.exports = prepRepo;
