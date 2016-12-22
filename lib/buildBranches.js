const Promise = require('bluebird');
const { spawn } = Promise.promisifyAll(require('child_process'));
const fs = require('fs');

const git = require('simple-git')(__dirname);
const githubApi = require('github-api');



function buildBranches(config, _, __, buildPath) {
    const { owner, repo, branches } = config;
    return new Promise((resolve, reject) => {
        console.log(`[${owner}/${repo}]: Building branches`);
        Promise.resolve(branches)
            .map(branch => buildBranch(config, branch, buildPath), { concurrency: 1 })
            .then(() => resolve());
    });
}

function buildBranch(config, { name, commit: { sha } }, buildPath) {
    const { repo, owner, build, repoPath } = config;
    return new Promise((resolve, reject) => {
        const branchPath = `${buildPath}/branch_${repo}_${name}`;
        if(!fs.existsSync(branchPath)) {
            cloneBranch(config, { name, sha }, branchPath).then(function() {
                buildProcess(config, name, sha, branchPath).then(() => {
                    resolve();
                });
            });
        } else {
            resetBranch(config, { name, sha }, branchPath).then(function() {
                buildProcess(config, name, sha, branchPath).then(() => {
                    resolve();
                });
            });
        }
    });
}

function cloneBranch(config, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const { repo, owner, build, repoPath } = config;
        git
            .clone(repoPath, branchPath, ['--local', '--single-branch'])
            .cwd(repoPath)
            .reset('hard')
            .checkout(sha)
            .then(() => console.log(`[${owner}/${repo}]: Finished cloning ${name}`))
            .then(() => resolve());
    });
}

function resetBranch(config, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const { repo, owner, build, repoPath } = config;
        git.cwd(repoPath)
            .reset('hard')
            .checkout(sha)
            .reset('hard')
            .then(() => resolve());
    });
}

function buildProcess({ owner, repo, build = []}, name, sha, branchPath) {
    console.log(`[${owner}/${repo}]: Starting build process ${name}`);
    return Promise.resolve(build)
        .map(({ proc, args = [], env = {} }) => runBuildProcess({ owner, repo }, { proc, args, env }, { name, sha }, branchPath), { concurrency: 1 })
        .catch(() => {
            console.log(`[${owner}/${repo}]: Could not build ${name}`);
        });
}

function runBuildProcess({ owner, repo }, { proc, args, env }, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const envVar = Object.assign({}, process.env, typeof env === 'object' && env ? env : {});
        const child = spawn(proc, args, { cwd: branchPath, env: envVar });


        child.stdout.on('data', (data) => console.log(`stdout: ${name} ${data}`));
        child.stderr.on('data', (data) => console.log(`stderr: ${name} ${data}`));
        child.on('close', (code) => {
            console.log(`[${owner}/${repo}]: Closed ${name} | ${code} | took ${(Math.round(Date.now() - start) / 1000)}s`);
            if(code !== 0) {
                return reject();
            }
            resolve();
        });
        child.on('exit', (code) => {
            if(code !== 0) {
                return reject();
            }
        });
    });
}

module.exports = buildBranches;
