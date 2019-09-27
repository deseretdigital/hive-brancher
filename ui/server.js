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
  Promise.resolve(getFormattedBranches())
    .then(allBranches => {
      res.send(allBranches);
      next();
    });
});

app.listen(port, () => console.log('Listening on port ' + port));
