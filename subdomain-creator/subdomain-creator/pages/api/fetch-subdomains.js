const { getSubdomainCollection, closeConnection } = require('../../helpers/mongoDBClient');

export default async function handler(req, res) {
  console.log('we want subdomains');
  try {
    const subdomainCollection = await getSubdomainCollection();
    const subdomainsCursor = await subdomainCollection.find({ _id: {"$exists" : true }});
    const subdomains = [];
    await subdomainsCursor.forEach(subdomain => subdomains.push(subdomain));
    res.status(200).json({ subdomains, error: null });
  } catch(err) {
    res.status(500).json({ error: err.result });
  } finally {
    closeConnection();
  }
}
