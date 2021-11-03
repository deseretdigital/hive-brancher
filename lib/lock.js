const fs = require("fs");
const log = require("./log");
const config = require('../config.js');
const LOCK_FILE_TIMEOUT = config.lockFileTimeout || 15;

function createLockFile(filename) {
  if (!fs.existsSync(`${filename}.lock`)) {
    log(`Creating ${filename}.lock`);
    fs.writeFileSync(`${filename}.lock`, new Date().toString());
  }
}

function deleteLockFile(filename) {
  if (fs.existsSync(`${filename}.lock`)) {
    log(`Deleting ${filename}.lock`);
    fs.unlinkSync(`${filename}.lock`);
    return;
  }
}

function isLockFileStale(filename) {
  const dateString = fs.readFileSync(`${filename}.lock`);
  const date = dateString && new Date(dateString);
  const currentDate = new Date();
  const diff = (currentDate - date) / 1000 / 60;
  // if the lock file is too old
  if (diff > LOCK_FILE_TIMEOUT || 15) {
    return true;
  } else {
    return false;
  }
}

function lockFileExists(filename) {
  if (!fs.existsSync(`${filename}.lock`)) {
    return false;
  }
  // if the lock file is stale, then delete it and pretend it never existed
  if (isLockFileStale(filename)) {
    deleteLockFile(filename);
    return false;
  }
  return true;
}

module.exports = { lockFileExists, createLockFile, deleteLockFile };