const { getSubdomainReposCollection, closeConnection } = require('../../helpers/mongoDBClient');
require('dotenv').config();
const Github = require('github-api');

//http://github-tools.github.io/github/docs/3.2.3/Repository.html#listBranches

//TODO token needs to be a part of the configuration settings, not hard coded
export default async function handler(req, res) {
    const gh = new Github({
        token: process.env.GITHUB_AUTH_TOKEN
    });
    const repos = await getRepos();
    const promises = [];
    repos.forEach(repo => {
        const ghRepo = gh.getRepo(process.env.GITHUB_ORG, repo);
        promises.push(ghRepo.listBranches());
    });
    const sortedBranches = [];
    await Promise.all(promises).then(responses => {
        for(const response of responses) {
            for(const branch of response.data) {
                if(sortedBranches.indexOf(branch.name) === -1) {
                    sortedBranches.push(branch.name);
                }
            }
        }
        res.status(200).json({ branches: sortedBranches.sort() });
    });
    
}



async function getRepos() {
  try {
    const reposCollection = await getSubdomainReposCollection();
    const reposCursor = await reposCollection.find({ _id: {"$exists" : true }});
    const repos = [];
    await reposCursor.forEach(repo => repos.push(repo.repo));
    return repos;
  } catch(err) {
    return [];
  } finally {
    closeConnection();
  }
}

