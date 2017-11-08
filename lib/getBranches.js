const git = require('simple-git')(__dirname);
const githubApi = require('github-api');
const log = require('./log');
const logVerbose = require('./logVerbose');

const git = require('simple-git')(__dirname);
const github = new githubApi({
    token: process.env.PERSONAL_GITHUB_TOKEN
});
const Promise = require('bluebird');

function getBranches(config, _, __, buildPath) {
    const { owner, repo } = config;
    return new Promise((resolve, reject) => {
        log(`[${owner}/${repo}]: Fetch branches`);
        const remoteRepo = github.getRepo(owner, repo);
        git.listRemote(['--heads'], data => {
            console.log(data);
        })
        // remoteRepo.listBranches().then(({ data = [] }) => {
        //     logVerbose(`Branches loaded: ${JSON.stringify(data)}`);
        //     resolve(Object.assign({}, config, { branches: data }));
        // });
    });
}

module.exports = getBranches;
