const { getSubdomainScriptsCollection, closeConnection } = require('../../helpers/mongoDBClient');
const mongodb = require('mongodb');

export default async function handler(req, res) {
  try {
    if(req.body && req.body._id) {
      const scriptsCollection = await getSubdomainScriptsCollection();
      const result = await scriptsCollection.deleteOne({
        _id: new mongodb.ObjectId(req.body._id.toString())
      });
      res.status(result.deletedCount === 1 ? 200 : 500).json({ deletedCount: result.deletedCount, error: !result.deletedCount ? 'Error deleting' : null });
    } else {
      res.status(400).json({ error: 'Cannot delete nothing' });
    }
  } catch(err) {
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
