const config = require('./config.js');

require('dotenv').config();

const buildPath = `${__dirname}/build`;

const Promise = require('bluebird');

const prepRepo = require('./lib/prepRepo');
const getBranches = require('./lib/getBranches');
const buildBranches = require('./lib/buildBranches');

Promise.resolve(config)
    .map((config) => prepRepo(config, buildPath), { concurrency: 1 })
    .map((...args) => getBranches(...args, buildPath), { concurrency: 1 })
    .map((...args) => buildBranches(...args, buildPath), { concurrency: 1 })
