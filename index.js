const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  LEGAL_TCP_SOCKET_OPTIONS,
} = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Set MongoDB with User name and Password
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@autopartscluster.9tbtl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// Run function - GET, POST, DELETE, PUT
async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("AutoParts").collection("parts");
    const ordersCollection = client.db("AutoParts").collection("orders");

    // GET API - AutoParts
    app.get("/parts", async (req, res) => {
      const result = await partsCollection.find().toArray();
      res.send(result);
    });

    // GET API - AutoPart
    app.get("/part/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await partsCollection.findOne(query);
      res.send(result);
    });

    // PUT API - Part
    app.put("/part/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const part = req.body;
      const updatedPart = {
        $set: part,
      };
      const result = await partsCollection.updateOne(filter, updatedPart);
      res.send(result);
    });

    // GET API - Order
    app.get("/order", async(req, res) =>{
      const email = req.headers.email
      const filter = {email: email}
      const result = await ordersCollection.find(filter).toArray()
      res.send(result)
    })

    // POST API - Order
    app.post("/order", async (req, res) => {
      const part = req.body;
      const result = await ordersCollection.insertOne(part);
      res.send(result);
    });
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
