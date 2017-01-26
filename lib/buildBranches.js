const Promise = require('bluebird');
const { spawn } = Promise.promisifyAll(require('child_process'));
const fs = require('fs');

const git = require('simple-git')(__dirname);
const githubApi = require('github-api');

const log = require('./log');
const logVerbose = require('./logVerbose');

function buildBranches(config, _, __, buildPath, apacheConfigDir) {
    const { owner, repo, branches } = config;
    const branchList = {};
    return new Promise((resolve, reject) => {
        log(`[${owner}/${repo}]: Building branches`);
        Promise.resolve(branches)
            .map(branch => {
                const { name } = branch;
                if(Array.isArray(branchList[name])) {
                    branchList[name].push({ owner, repo });
                } else {
                    branchList[name] = [{owner, repo}];
                }
                return buildBranch(config, branch, buildPath);
            }, { concurrency: 1 })
            .then(() => resolve(branchList));
    });
}

function buildBranch(config, branch, buildPath) {
    const { repo, owner, build, repoPath } = config;
    const { name, commit: { sha } } = branch;
    return new Promise((resolve, reject) => {
        const branchPath = `${buildPath}/branch_${repo}_${name}`;
        if(!fs.existsSync(branchPath)) {
            cloneBranch(config, { name, sha }, branchPath).then(function() {
                buildProcess(config, name, sha, branchPath).then(() => {
                    resolve(branch);
                });
            });
        } else {
            if(fs.existsSync(`${branchPath}/.build.txt`)) {
                const savedBuildState = fs.readFileSync(`${branchPath}/.build.txt`);
                if(`${savedBuildState}` === sha) {
                    logVerbose(`[${owner}/${repo}#${sha}]: Skipping build for ${name}`)
                    return resolve(branch);
                }
            }
            logVerbose(`[${owner}/${repo}#${name}]: Resetting branch at ${sha}`)
            resetBranch(config, { name, sha }, branchPath).then(function() {
                logVerbose(`[${owner}/${repo}#${name}]: Starting build process`)
                buildProcess(config, name, sha, branchPath).then(() => {
                    resolve(branch);
                });
            });
        }
    });
}

function cloneBranch(config, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const { repo, owner, build, repoPath } = config;
        try {
            git
                .clone(repoPath, branchPath, ['--local', '--single-branch'])
                .cwd(branchPath)
                .clean('f', { '-d': null, '-fx': ""})
                .reset('hard')
                .checkout(sha)
                .then(() => log(`[${owner}/${repo}#${name}]: Finished cloning at ${sha}`))
                .then(() => resolve());
        } catch(err) {
            log(`[${owner}/${repo}]: ${err}`);
        }
    });
}

function resetBranch(config, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const { repo, owner, build, repoPath } = config;
        try {
            git
                .cwd(repoPath)
                .clean('f', { '-d': null, '-fx': ""})
                .checkout(name)
                .then(() => logVerbose(`[${owner}/${repo}#${name}]: Reset repo base`))
                .checkout('master')
                .cwd(branchPath)
                .clean('f', { '-d': null, '-fx': ""})
                .pull('origin', 'master')
                .then(() => logVerbose(`[${owner}/${repo}#${name}]: Pull latest to branch folder`))
                .clean('f', { '-d': null, '-fx': ""})
                .checkout(sha)
                .then(() => resolve());
        } catch(err) {
            log(`[${owner}/${repo}]: ${err}`);
        }
    });
}

function buildProcess({ owner, repo, build = []}, name, sha, branchPath) {
    log(`[${owner}/${repo}]: Starting build process ${name}`);
    return Promise.resolve(build)
        .map(({ proc, args = [], env = {} }) => runBuildProcess({ owner, repo }, { proc, args, env }, { name, sha }, branchPath), { concurrency: 1 })
        .catch(() => {
            log(`[${owner}/${repo}]: Could not build ${name}`);
        })
        .then(() => {
            fs.writeFileSync(`${branchPath}/.build.txt`, sha);
            log(`[${owner}/${repo}]: Writing build state for ${name} | ${sha}`)
        });
}

function runBuildProcess({ owner, repo }, { proc, args, env }, { name, sha }, branchPath) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const envVar = Object.assign({}, process.env, typeof env === 'object' && env ? env : {});
        const child = spawn(proc, args, { cwd: branchPath, env: envVar });


        /*child.stdout.on('data', (data) => log(`stdout: ${name} ${data}`));*/
        child.stderr.on('data', (data) => console.error(`stderr: ${name} ${data}`));
        child.on('close', (code) => {
            log(`[${owner}/${repo}]: Closed ${name} | code ${code} | took ${(Math.round(Date.now() - start) / 1000)}s | ${proc}`);
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
