const express = require('express');
const app = express();
const fs = require('fs');
const Promise = require('bluebird');
const getFormattedBranches = require('../lib/getFormattedBranches');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.argv[2] || 3000;

app.use(express.static('./'));
app.use('/whitelist', express.static('../whitelist.json'));
app.post('/save-whitelist', (req, res, next) => {
  const whitelist = req.body.whitelist || [{ branch: "master", subdomain: "master" }];
  fs.writeFileSync('../whitelist.json', JSON.stringify(req.body.whitelist));
  res.send(req.body.whitelist);
  next();
});

app.get('/branches', (req, res, next) => {
  Promise.resolve(resolve => resolve(getFormattedBranches())).then(allBranches => {
    console.log(allBranches);
    res.send(allBranches);
    next();
  });
    // // Get the branches for each project, but skip ones we indicate
    // .filter((project) => !project.ignoreBranches)
    // .map((project) => getBranches(project, null, null, buildPath, false), { concurrency: 1 })
    // .then((repoList) => {
    //   const allBranches = {};
    //   repoList.forEach(repo => {
    //     repoName = repo.repo;
    //     repo.branches.forEach(branch => {
    //       if (
    //         branch.name !== 'master' &&
    //         !allBranches[repoName]
    //       ) {
    //         allBranches[repoName] = [branch.name];
    //       } else if (
    //         branch.name !== 'master' &&
    //         allBranches[repoName].indexOf(branch.name) === -1
    //       ) {
    //         allBranches[repoName].push(branch.name);
    //       }
    //     });
    //   });
    //   Object.keys(allBranches).forEach((repo) => {
    //     allBranches[repo].sort();
    //   });
    //   res.send(allBranches);
    //   next();
    // });
});

app.listen(port, () => console.log('Listening on port ' + port));
