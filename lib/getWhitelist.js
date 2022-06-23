function getWhitelist() {
  let whitelist = [];
  try {
    whitelist = require("./../whitelist.json");
  } catch (e) {}

  if (!Array.isArray(whitelist)) {
    return [];
  }
  return whitelist;
}

function getSubdomainsFromBranchNames(branchNames) {
  if (!branchNames) {
    return [];
  }
  return branchNames.map(branch => getSubdomainFromBranchName(branch));
}

function getSubdomainFromBranchName(branchName, wl = []) {
  const whitelist = wl ? wl : getWhitelist();
  const whiteListIdx = whitelist.map(({ branch }) => branch).indexOf(branchName);
  return whiteListIdx !== -1 ? whitelist[whiteListIdx].subdomain : branchName;
}

module.exports = { getWhitelist, getSubdomainFromBranchName, getSubdomainsFromBranchNames };