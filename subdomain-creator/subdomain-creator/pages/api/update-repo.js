const { getSubdomainReposCollection, closeConnection } = require('../../helpers/mongoDBClient');
const mongodb = require('mongodb');

export default async function handler(req, res) {
  try {
    if(req.body && req.body.repo) {
      const reposCollection = await getSubdomainReposCollection();
      const { _id, ...repoWithoutId } = req.body.repo;
      const result = await reposCollection.updateOne({
          _id: new mongodb.ObjectId(_id.toString())
      }, { "$set": repoWithoutId});
      res.status(200).json({ yay: 'you'});
      res.status(result.acknowledged ? 200 : 500).json({ modifiedCount: result.modifiedCount, error: !result.acknowledged ? 'Error updating' : null });
    } else {
      res.status(400).json({ error: 'A repo is required' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
