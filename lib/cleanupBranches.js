const Promise = require("bluebird");
const glob = require("glob");
const fs = require("fs");
const remove = require("remove");
const log = require("./log");
const { getSubdomainFromBranchName } = require("./../lib/getWhitelist");

function deleteBranch({ branch, repos }, config) {
  const { apacheConfigDir, apacheLogDir, branchConfigPath, buildPath, testDomain } = config;
  return new Promise((resolve, reject) => {
    Promise.resolve(repos)
      .map(
        repo => {
          log(`Deleting ${repo}/${branch}`);
          const branchDirPath = `${buildPath}/branch_${repo}_${branch}`;
          return new Promise((resolve, reject) => {
            log(`Removing ${branchDirPath}`);
            remove(branchDirPath, err => {
              resolve(repo);
            });
          });
        },
        { concurrency: 1 }
      )
      .map(
        repo => {
          const branchConfigPath = `${apacheConfigDir}/branch_${branch}`;
          return new Promise((resolve, reject) => {
            log(`Removing ${branchConfigPath}`);
            remove(branchConfigPath, err => {
              resolve(repo);
            });
          });
        },
        { concurrency: 1 }
      )
      .map(
        repo => {
          const subdomain = getSubdomainFromBranchName(branch);
          const logs = `${apacheLogDir}/*${subdomain}.${testDomain}*`;
          log(`Looking for pattern ${logs} in logs`);
          return new Promise((resolve, reject) => {
            const files = glob.sync(logs);
            if (files.length > 0) {
              log(`Removing ${subdomain} logs`);
              for (const file in files){
                log(`Removing log ${file}`);
                fs.unlinkSync(file)
              }
            }
            resolve(repo);
          });
        },
        { concurrency: 1 }
      )
      .then(() => resolve());
  });
}

module.exports = function cleanupBranches(branchSets = [], config) {
  return new Promise((resolve, reject) => {
    const flaggedForDeletion = [];

    const branchesOld = branchSets[0];

    const branchesNew = branchSets[1];

    Object.keys(branchesOld).forEach(branch => {
      if (branch === "master") {
        // log(`Script attempted to delete master; prevented`);
        return;
      }
      const branchRepos = branchesOld[branch];

      if (!Array.isArray(branchRepos)) {
        return;
      }

      if (typeof branchesNew[branch] === "undefined") {
        log(`[${branchRepos.join(",")}#${branch}] Flagged for deletion`);
        flaggedForDeletion.push({
          branch,
          repos: branchRepos
        });
      } else if (branchesNew[branch].join() !== branchRepos.join()) {
        log(
          `[${branchRepos.join(
            ","
          )}#${branch}] Some flagged for deletion: ${branchesNew[
            branch
          ].join()} | ${branchRepos.join()}`
        );
        log(`Should delete ${branchRepos.join(", ")}`);
        flaggedForDeletion.push({
          branch,
          repos: branchRepos
        });
      }
    });
    Promise.resolve(flaggedForDeletion)
      .map(obj => deleteBranch(obj, config))
      .then(() => resolve(branchSets));
  });
};
