const { getSubdomainCollection, closeConnection } = require('../../helpers/mongoDBClient');
require('dotenv').config();

export default async function handler(req, res) {
  try {
    if(req.body && req.body.subdomain && req.body.branch && req.body.name) {
      const subdomainCollection = await getSubdomainCollection();
      const ports = await getPorts(subdomainCollection);
      const result = await subdomainCollection.insertOne({
        subdomain: req.body.subdomain.toString(),
        branch: req.body.branch.toString(),
        name: req.body.name.toString(),
        date: new Date(),
        ports
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

async function getPorts(subdomainCollection) {
  const portStart = Number(process.env.PORT_RANGE_START);

  const maxResult = await subdomainCollection.aggregate([{
    "$group": {
      _id: {},
      maxPort: { "$max": "$ports" }
    }
  }]);
  let maxPort = portStart;
  await maxResult.forEach(maxR => {
    maxPort = maxR.maxPort[0];
  });
  //todo put master in there and make it non deletable 
  maxPort++;
  const ports = [];
  for (let i = 0; i < Number(process.env.PORT_RANGE_COUNT); i++) {
    ports.push(Number(maxPort) + (i * Number(process.env.PORT_RANGE_INCREMENT)));
  }
  return ports;
}
