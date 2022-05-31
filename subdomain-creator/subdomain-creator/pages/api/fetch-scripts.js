const { getSubdomainScriptsCollection, closeConnection } = require('../../helpers/mongoDBClient');

export default async function handler(req, res) {
  try {
    const scriptsCollection = await getSubdomainScriptsCollection();
    const scriptsCursor = await scriptsCollection.find({ _id: {"$exists" : true }});
    const scripts = [];
    await scriptsCursor.forEach(script => scripts.push(script));
    res.status(200).json({ scripts, error: null });
  } catch(err) {
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
