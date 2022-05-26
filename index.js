const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  LEGAL_TCP_SOCKET_OPTIONS,
} = require("mongodb");
const { response } = require("express");
const jwt = require("jsonwebtoken");
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

/* ================================================= Middlewares: Verify JWT Token ================================================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;

    next();
  });
};
/* ================================================= Middlewares: Verify JWT Token ^ ================================================= */

// Run function - GET, POST, DELETE, PUT
async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("AutoParts").collection("parts");
    const ordersCollection = client.db("AutoParts").collection("orders");
    const usersCollection = client.db("AutoParts").collection("users");
    const reviewsCollection = client.db("AutoParts").collection("reviews");

    /* ================================================= Middlewares: Verify Admin Start ================================================= */
    // Middlewares - to Verify Admin
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterUser = await usersCollection.findOne({
        email: requester,
      });
      if (requesterUser.role === "admin") {
        next();
      } else {
        res.status(401).send({ message: "Forbidden Request" });
      }
    };
    /* ================================================= Middlewares: Verify Admin ^ ================================================= */

    /* ================================================= Generate JWT Token Start ================================================= */
    // PUT API - Generate JWT Token
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN);
      res.send({ result, token });
    });
    /* ================================================= Generate JWT Token ^ ================================================= */

    /* ================================================= Use Admin Start ================================================= */
    // Get API - useAdmin [hook]
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });

    // Validation For Make Admin
    app.put(
      "/users/admin/:email",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };

        const updatedDoc = {
          $set: { role: "admin" },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );
    /* ================================================= Use Admin ^ ================================================= */

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

    // POST API - AutoPart
    app.post("/part", verifyToken, verifyAdmin, async (req, res) => {
      const itemInfo = req.body;
      const result = await partsCollection.insertOne(itemInfo);
      res.send(result);
    });

    // DELETE API - AutoPart
    app.delete("/part/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await partsCollection.deleteOne(filter);
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
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.findOne(filter);
      res.send(result);
    });

    // GET API - Orders
    app.get("/order", async (req, res) => {
      const email = req.headers.email;
      const filter = { email: email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // POST API - Order
    app.post("/order", verifyToken, async (req, res) => {
      const part = req.body;
      const result = await ordersCollection.insertOne(part);
      res.send(result);
    });

    // DELETE API - Order
    app.delete("/order/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.send(result);
    });
    /* ================================================= Orders ^ ================================================= */

    /* ================================================= Users Start ================================================= */
    // GET API - Users
    app.get("/user", verifyToken, async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await usersCollection.findOne(filter);
      res.send(result);
    });

    // GET API - Users (Without Fitlering)
    app.get("/make-user", verifyToken, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // PUT API - User
    app.put("/user", verifyToken, async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const user = req.body;
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
