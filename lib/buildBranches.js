const fetch = require("node-fetch");
const Promise = require("bluebird");
const { spawn } = Promise.promisifyAll(require("child_process"));
const fs = require("fs");

const git = require("simple-git")(__dirname);

const log = require("./log");
const logVerbose = require("./logVerbose");

function buildBranches(config, _, __, buildPath, apacheConfigDir) {
  const { owner, repo, branches } = config;
  const branchList = {};
  return new Promise((resolve, reject) => {
    log(`[${owner}/${repo}]: Building branches`);
    Promise.resolve(branches)
      .mapSeries(
        branch => {
          const { name } = branch;
          logVerbose(`[${owner}/${repo}]: Building ${name}`);
          if (Array.isArray(branchList[name])) {
            branchList[name].push({ owner, repo });
          } else {
            branchList[name] = [{ owner, repo }];
          }
          return buildBranch(config, branch, buildPath);
        },
        { concurrency: 1 }
      )
      .then(() => resolve(branchList));
  });
}

function buildBranch(config, branch, buildPath) {
  const { repo, owner, build, repoPath } = config;
  const { name, sha } = branch;
  return new Promise((resolve, reject) => {
    const branchPath = `${buildPath}/branch_${repo}_${name}`;
    if (!fs.existsSync(branchPath)) {
      log(`[${owner}/${repo}]: Cloning branch ${name}`);
      cloneBranch(config, { name, sha }, branchPath).then(function() {
        buildProcess(config, name, sha, branchPath).then(() => {
          resolve(branch);
        });
      });
    } else {
      if (fs.existsSync(`${branchPath}/.build.txt`)) {
        const savedBuildState = fs.readFileSync(`${branchPath}/.build.txt`);
        if (`${savedBuildState}` === sha) {
          logVerbose(`[${owner}/${repo}#${sha}]: Skipping build for ${name}`);
          return resolve(branch);
        }
      }
      logVerbose(`[${owner}/${repo}#${name}]: Resetting branch at ${sha}`);
      resetBranch(config, { name, sha }, branchPath).then(function() {
        logVerbose(`[${owner}/${repo}#${name}]: Starting build process`);
        return buildProcess(config, name, sha, branchPath).then(() => {
          return resolve(branch);
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
        .clone(repoPath, branchPath, ["--local"])
        .cwd(branchPath)
        .clean("f", { "-d": null, "-fx": "" })
        .reset("hard")
        .checkout(sha)
        .then(() =>
          log(`[${owner}/${repo}#${name}]: Finished cloning at ${sha}`)
        )
        .then(() => resolve());
    } catch (err) {
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
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Clean ${repoPath}`))
        .clean("f", { "-d": null, "-fx": "" })
        .then(() =>
          logVerbose(`[${owner}/${repo}#${name}]: Reset origin/${name}`)
        )
        .raw(["reset", "--hard", `origin/${name}`])
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Checkout ${name}`))
        .checkout(name)
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Clean again`))
        .clean("f", { "-d": null, "-fx": "" })
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Pull`))
        .pull()
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Checkout master`))
        .checkout("master")
        .cwd(branchPath)
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: Clean`))
        .clean("f", { "-d": null, "-fx": "" })
        .then(() =>
          logVerbose(`[${owner}/${repo}#${name}]: git reset --hard HEAD`)
        )
        .raw(["reset", "--hard", "HEAD"])
        .then(() => logVerbose(`[${owner}/${repo}#${name}]: git fetch`))
        .fetch()
        .then(() =>
          logVerbose(`[${owner}/${repo}#${name}]: git checkout ${sha}`)
        )
        .checkout(sha)
        .then(() => resolve());
    } catch (err) {
      log(`[${owner}/${repo}]: ${err}`);
    }
  });
}

function buildProcess(
  { owner, repo, build = [], webhook },
  name,
  sha,
  branchPath
) {
  log(`[${owner}/${repo}]: Starting build process ${name}`);
  return Promise.resolve(build)
    .mapSeries(
      ({ proc, args = [], env = {}, proceedOnFailure = false }) =>
        runBuildProcess(
          { owner, repo },
          { proc, args, env, proceedOnFailure },
          { name, sha },
          branchPath
        ),
      { concurrency: 1 }
    )
    .catch(() => {
      log(`[${owner}/${repo}]: Could not build ${name}`);
    })
    .then(() => {
      fs.writeFileSync(`${branchPath}/.build.txt`, sha);
      log(`[${owner}/${repo}]: Writing build state for ${name} | ${sha}`);
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        if (!webhook) {
          return resolve();
        }
        log(`[${owner}/${repo}] Sending webhook`);
        fetch(webhook, {
          method: "POST",
          body: JSON.stringify({
            text: `[${owner}/${repo}] \`${name}\` built successfully`
          })
        }).then(response => {
          resolve(response.ok);
        });
      });
    });
}

// function sendWebhook(webhook)

function runBuildProcess(
  { owner, repo },
  { proc, args, env, proceedOnFailure },
  { name, sha },
  branchPath
) {
  return new Promise((resolve, reject) => {
    log(`arguments listed ${JSON.stringify(args)}`);
    const start = Date.now();
    const envVar = Object.assign(
      {},
      process.env,
      typeof env === "object" && env ? env : {}
    );
    const child = spawn(
      proc,
      args.map(arg => {
        const branchPath = arg.replace("${branchname}", name);
        return branchPath;
        const masterPath = arg.replace("${branchname}", "master");
        return fs.existsSync(branchPath) ? branchPath : masterPath;
      }),
      { cwd: branchPath, env: envVar }
    );

    // child.stdout.on('data', (data) => log(`stdout: ${name} ${data}`));
    child.stderr.on("data", data => log(`stderr: ${name} ${data}`));
    child.on("close", code => {
      log(
        `[${owner}/${repo}]: Closed ${name} | code ${code} | took ${Math.round(
          Date.now() - start
        ) / 1000}s | ${proc}`
      );
      if (code !== 0 && !proceedOnFailure) {
        return reject();
      }
      resolve();
    });
    child.on("exit", code => {
      if (code !== 0 && !proceedOnFailure) {
        return reject();
      }
      resolve();
    });
  });
}

module.exports = buildBranches;
