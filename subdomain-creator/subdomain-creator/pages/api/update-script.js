const { getSubdomainScriptsCollection, closeConnection } = require('../../helpers/mongoDBClient');
const mongodb = require('mongodb');

export default async function handler(req, res) {
  try {
    if(req.body && req.body.type) {
      const scriptCollection = await getSubdomainScriptsCollection();
      const result = await scriptCollection.updateOne({
          _id: new mongodb.ObjectId(req.body._id.toString())
      }, {
        "$set" : {
            type: req.body.type.toString(),
            contents: (req.body.contents || '').toString(),
            path: (req.body.path || '').toString(),
            baseCommand: (req.body.baseCommand || '').toString(),
            script: (req.body.script || '').toString()
        }
      });
      res.status(result.acknowledged ? 200 : 500).json({ modifiedCount: result.modifiedCount, error: !result.acknowledged ? 'Error updating' : null });
    } else {
      res.status(400).json({ error: 'Type is required' });
    }
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
