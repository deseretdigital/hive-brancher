const Promise = require('bluebird');
const config = require('../config.js');
const getBranches = require('../lib/getBranches');
const { projects = [], buildPath } = config;

function getFormattedBranches() {
  return Promise.resolve(projects)
  // Get the branches for each project, but skip ones we indicate
  .filter((project) => !project.ignoreBranches)
  .map((project) => getBranches(project, null, null, buildPath, false), { concurrency: 1 })
  .then((repoList) => {
    const allBranches = {};
    repoList.forEach(repo => {
      repoName = repo.repo;
      repo.branches.forEach(branch => {
        if (
          branch.name !== 'master' &&
          !allBranches[repoName]
        ) {
          allBranches[repoName] = [branch.name];
        } else if (
          branch.name !== 'master' &&
          allBranches[repoName].indexOf(branch.name) === -1
        ) {
          allBranches[repoName].push(branch.name);
        }
      });
    });
    Object.keys(allBranches).forEach((repo) => {
      allBranches[repo].sort();
    });
    return allBranches;
  });
}

module.exports = getFormattedBranches;