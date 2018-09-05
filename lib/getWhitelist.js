function getWhitelist() {
  let whitelist = [];
  try {
    whitelist = require("./../whitelist.json");
  } catch (e) {}
  return whitelist;
}

function getSubdomainsFromBranchNames(branchNames) {
  if (!branchNames) {
    return [];
  }
  return branchNames.map(getSubdomainFromBranchName);
}

function getSubdomainFromBranchName(branchName) {
  const whitelist = getWhitelist();
  const whiteListIdx = Array.isArray(whitelist)
    ? whitelist.map(({ branch }) => branch).indexOf(branchName)
    : -1;
  const subdomain =
    whiteListIdx !== -1 ? whitelist[whiteListIdx].subdomain : branchName;
  return subdomain
}

module.exports = { getWhitelist, getSubdomainFromBranchName, getSubdomainsFromBranchNames };