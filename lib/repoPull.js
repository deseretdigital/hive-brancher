const git = require('simple-git')(__dirname);
const Promise = require('bluebird');

function repoPull({ owner, repo }, repoPath) {
    return new Promise((resolve, reject) => {
        console.log(`[${owner}/${repo}]: Pull from origin`);
        git.cwd(repoPath)
            .fetch()
            .reset('hard')
            .checkout('master')
            .pull()
            .then(err => err ? reject(err) : resolve())
    });

}

module.exports = repoPull;
