const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const cors = require("cors");
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Set MongoDB with User name and Password
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@autopartscluster.9tbtl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Run function - GET, POST, DELETE, PUT
async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("AutoParts").collection("parts");

    // GET API - AutoParts
    app.get("/parts", async(req, res) => {
      const result = await partsCollection.find().toArray()
      res.send(result)
    })


  } finally {
    // Nothing Here
  }
}
run().catch(console.dir);

// Base End Point
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
