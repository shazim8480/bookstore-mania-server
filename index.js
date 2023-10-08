require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb://localhost:27017`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("bookstore-mania");
    const booksCollection = db.collection("books");

    // get all books
    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find({});
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    // add a book
    app.post("/add-book", async (req, res) => {
      const book = req.body;

      const result = await booksCollection.insertOne(book);

      res.send(result);
    });

    // get book by id
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    // delete book
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    // review api
    app.post("/review/:id", async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.review;

      console.log(bookId);
      console.log(review);

      const result = await productCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { reviews: review } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("book not found or review not added");
        res.json({ error: "book not found or review not added" });
        return;
      }

      console.log("review added successfully");
      res.json({ message: "review added successfully" });
    });

    app.get("/review/:id", async (req, res) => {
      const bookId = req.params.id;

      const result = await booksCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "book not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Welcome to bookstore mania!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
