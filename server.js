const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 8000;

const uri = 'mongodb+srv://nighatechglobal:yC2h3ooatd6lPKv2@24krafts.ocst4.mongodb.net/AmaGnss?retryWrites=true&w=majority';

let collection;

app.use(cors());
app.use(bodyParser.json());

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db('AmaGnss');
    collection = db.collection('gnsdata');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.post('/api/location', async (req, res) => {
  try {
    const { device_id, latitude, longitude, speed, altitude, satellites, timestamp } = req.body;

    if (!device_id || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = {
      device_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed: parseFloat(speed) || 0,
      altitude: parseFloat(altitude) || 0,
      satellites: parseInt(satellites) || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    const result = await collection.insertOne(doc);
    res.json({ status: 'success', insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/location/:device_id', async (req, res) => {
  try {
    const device_id = req.params.device_id;
    if (!device_id) return res.status(400).json({ error: 'Missing device_id' });

    const docs = await collection.find({ device_id }).sort({ timestamp: 1 }).limit(100).toArray();

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
