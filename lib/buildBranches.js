const { spawn } = require('child_process');
const fs = require('fs');

const git = require('simple-git')(__dirname);
const githubApi = require('github-api');

const Promise = require('bluebird');

function buildBranches(config, _, __, buildPath) {
    const { owner, repo, branches } = config;
    return new Promise((resolve, reject) => {
        console.log(`[${owner}/${repo}]: Building branches`);
        Promise.resolve(branches)
            .map(branch => buildBranch(config, branch, buildPath, { concurrency: 1 }))
            .then(() => resolve());
    });
}

function buildBranch(config, { name, commit: { sha } }, buildPath) {
    const { repo, owner, build, repoPath } = config;
    return new Promise((resolve, reject) => {
        const branchPath = `${buildPath}/branch_${repo}_${name}`;
        console.log(`[${owner}/${repo}]: Building ${name}`);
        if(!fs.existsSync(branchPath)) {
            git
                .clone(repoPath, branchPath, ['--local', '--single-branch'])
                .cwd(repoPath)
                .checkout(sha)
                .then(_ => {
                    console.log(`[${owner}/${repo}]: Finished cloning ${name}`);
                    resolve();
                });
        } else {
            git.cwd(repoPath)
                .reset('hard')
                .checkout(sha)
                .then(() => buildProcess(config, name, sha, branchPath ))
                .then(() => resolve());
        }
    });
}

function buildProcess({ build = []}, name, sha, branchPath) {
    return new Promise((resolve, reject) => {
        console.log(build, name, sha, branchPath);
        resolve();
    });
}

module.exports = buildBranches;
