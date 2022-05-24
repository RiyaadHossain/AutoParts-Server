const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  LEGAL_TCP_SOCKET_OPTIONS,
} = require("mongodb");
const express = require("express");
const cors = require("cors");
const { response } = require("express");
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
    const usersCollection = client.db("AutoParts").collection("users");
    const reviewsCollection = client.db("AutoParts").collection("reviews");

    /* ================================================= Auto Parts Start ================================================= */
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
    /* ================================================= Auto Parts ^ ================================================= */

    /* ================================================= Orders Start ================================================= */
    // GET API - Order
    app.get("/order", async (req, res) => {
      const email = req.headers.email;
      const filter = { email: email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // POST API - Order
    app.post("/order", async (req, res) => {
      const part = req.body;
      const result = await ordersCollection.insertOne(part);
      res.send(result);
    });
    /* ================================================= Orders ^ ================================================= */

    /* ================================================= Users Start ================================================= */
    // GET API - Users
    app.get("/user", async (req, res) => {
      const email = req.headers.email;
      const filter = { email: email };
      const result = usersCollection.findOne(filter);
      res.send(result);
    });

    // POST API - User
    app.post("/user", async (req, res) => {
      const userInfo = req.body;
      const result = usersCollection.insertOne(userInfo);
      res.send(result);
    });

    // PUT API - User
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      console.log(user);
      const options = { upsert: true };
      const updatedUser = {
        $set: user,
      };
      const result = usersCollection.updateOne(filter, updatedUser, options);
      res.send(result);
    });
    /* ================================================= Users ^ ================================================= */

    /* ================================================= Reviews Start ================================================= */
    // GET API - Review
    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // POST API - Review
    app.post("/review", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });
    /* ================================================= Reviews ^ ================================================= */
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
