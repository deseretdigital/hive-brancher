const { getSubdomainReposCollection, closeConnection } = require('../../helpers/mongoDBClient');

export default async function handler(req, res) {
  try {
    const reposCollection = await getSubdomainReposCollection();
    const reposCursor = await reposCollection.find({ _id: {"$exists" : true }});
    const repos = [];
    await reposCursor.forEach(repo => repos.push(repo));
    res.status(200).json({ repos, error: null });
  } catch(err) {
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
