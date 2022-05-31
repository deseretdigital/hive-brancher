const { getSubdomainScriptsCollection, closeConnection } = require('../../helpers/mongoDBClient');

export default async function handler(req, res) {
  try {
    if(req.body && req.body.type) {
      const scriptCollection = await getSubdomainScriptsCollection();
      const result = await scriptCollection.insertOne({
        type: req.body.type.toString(),
        contents: (req.body.contents || '').toString(),
        path: (req.body.path || '').toString(),
        baseCommand: (req.body.baseCommand || '').toString(),
        script: (req.body.script || '').toString()
      });
      res.status(result.insertedId ? 200 : 500).json({ insertedId: result.insertedId, error: !result.insertedId ? 'Error inserting' : null });
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
