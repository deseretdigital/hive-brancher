let {
  projects,
  buildPath,
  apacheConfigDir
} = require('../config.js');
const fs = require('fs');
const { execSync } = require('child_process');

let builtFilesToKeep = ['status.json'];
let apacheConfigsToKeep = [];

// Now, generate those files to keep
let currentBranches = fs.readFileSync('/var/www/hive-brancher/whitelist.json');
currentBranches = JSON.parse(currentBranches);
projects.forEach(p => {
  builtFilesToKeep.push(`base_${p.repo}`);
  currentBranches.forEach(cb => {
    builtFilesToKeep.push(`branch_${p.repo}_${cb.branch}`);
  });
});
currentBranches.forEach(cb => {
  apacheConfigsToKeep.push(`branch_${cb.branch}.conf`);
});

// List of files and directories to delete
let toDelete = [];

fs.readdirSync(buildPath).forEach(builtFile => {
  if(builtFilesToKeep.indexOf(builtFile) === -1) {
    toDelete.push(`${buildPath}/${builtFile}`);
  }
});

fs.readdirSync(apacheConfigDir).forEach(configFile => {
  if(apacheConfigsToKeep.indexOf(configFile) === -1) {
    toDelete.push(`${apacheConfigDir}/${configFile}`);
  }
});

// Now, delete them all
toDelete.forEach(f => {
  const stat = fs.statSync(f);
  if(stat.isDirectory()) {
    console.log(`Deleting files in ${f}...`);
    execSync(`rm -rf ${f}`);
  } else if(stat.isFile()) {
    console.log(`Deleting ${f}...`);
    fs.unlinkSync(f);
  }
});

console.log('Finished!');