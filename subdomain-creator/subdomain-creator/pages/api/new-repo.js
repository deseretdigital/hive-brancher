const { getSubdomainReposCollection, closeConnection } = require('../../helpers/mongoDBClient');

export default async function handler(req, res) {
  try {
    if(req.body && req.body.repo) {
      const reposCollection = await getSubdomainReposCollection();
      const result = await reposCollection.insertOne({
        repo: req.body.repo.toString(),
        date: new Date()
      });
      res.status(result.insertedId ? 200 : 500).json({ insertedId: result.insertedId, error: !result.insertedId ? 'Error inserting' : null });
    } else {
      res.status(400).json({ error: 'All fields are required' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
