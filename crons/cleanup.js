let {
  projects,
  buildPath,
  apacheConfigDir
} = require('../config.js');
const fs = require('fs');
const { execSync } = require('child_process');
const getFormattedBranches = require('../lib/getFormattedBranches');
const whitelistJsonPath = '/var/www/hive-brancher/whitelist.json';

let builtFilesToKeep = ['status.json'];
let apacheConfigsToKeep = [];

// Grab all of the current branches from remote (github)
Promise.resolve(getFormattedBranches())
  .then(remoteBranches => {
    // List of files and directories to delete
    let toDelete = [];

    // Grab everything in whitelist.json
    let currentBranches = fs.readFileSync(whitelistJsonPath);
    currentBranches = JSON.parse(currentBranches);

    // Remove things from whitelist.json that aren't on remote
    currentBranches = currentBranches.reduce((acc, whitelistBranch) => {
      // Always leave master
      if(whitelistBranch.subdomain === 'master') {
        acc.push(whitelistBranch);
        return acc;
      }

      // Determine if branch exists on any of the remote repos 
      let onRemote = false;
      Object.keys(remoteBranches).forEach(remoteRepo => {
        if(remoteBranches[remoteRepo].indexOf(whitelistBranch.branch) !== -1) {
          onRemote = true;
        }
      });
      if(onRemote) {
        acc.push(whitelistBranch);
        return acc;
      }
        
      return acc;
    }, []);

    // Write that updated version of whitelist.json to file
    fs.writeFileSync(whitelistJsonPath, JSON.stringify(currentBranches));

    // Now, generate those files to keep
    projects.forEach(p => {
      builtFilesToKeep.push(`base_${p.repo}`);
      currentBranches.forEach(cb => {
        builtFilesToKeep.push(`branch_${p.repo}_${cb.branch}`);
      });
    });
    currentBranches.forEach(cb => {
      apacheConfigsToKeep.push(`branch_${cb.branch}.conf`);
    });

    fs.readdirSync(buildPath).forEach(builtFile => {
      if (builtFilesToKeep.indexOf(builtFile) === -1) {
        toDelete.push(`${buildPath}/${builtFile}`);
      }
    });

    fs.readdirSync(apacheConfigDir).forEach(configFile => {
      if (apacheConfigsToKeep.indexOf(configFile) === -1) {
        toDelete.push(`${apacheConfigDir}/${configFile}`);
      }
    });

    // Now, delete them all
    toDelete.forEach(f => {
      const stat = fs.statSync(f);
      if (stat.isDirectory()) {
        console.log(`Deleting files in ${f}...`);
        execSync(`rm -rf ${f}`);
      } else if (stat.isFile()) {
        console.log(`Deleting ${f}...`);
        fs.unlinkSync(f);
      }
    });

    console.log('Finished!');
  });
