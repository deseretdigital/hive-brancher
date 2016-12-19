const git = require('simple-git')(__dirname);
const githubApi = require('github-api');

const github = new githubApi({
    token: process.env.PERSONAL_GITHUB_TOKEN
});
const Promise = require('bluebird');

function getBranches(config, _, __, buildPath) {
    const { owner, repo } = config;
    return new Promise((resolve, reject) => {
        console.log(`[${owner}/${repo}]: Fetch branches`);
        const remoteRepo = github.getRepo(owner, repo);
        remoteRepo.listBranches().then(({ data = [] }) => {
            resolve(Object.assign({}, config, { branches: data }));
        });
    });
}

module.exports = getBranches;
