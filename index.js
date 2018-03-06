const cool = require("cool-ascii-faces");
const express = require("express");
const pg = require("pg");
const path = require("path");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("express-jwt");
const uuidv4 = require("uuid/v4");

const { Pool, Client } = require("pg");
const connectionString = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = new Pool({
  connectionString: connectionString
});

app = express()
  .use(express.static(path.join(__dirname, "public")))
  .use(bodyParser.json())
  .use(cors())
  //.use(jwt({ secret: JWT_SECRET}))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .use("/api", (req, res, next) => {
    console.log(req);
    //if(req.body.access_token == JWT_SECRET){
    //console.log("token found", req);

    next();
  })
  .get("/api/get_books", function(request, response) {
    pool.connect().then(client => {
      return client
        .query("SELECT * FROM public.books")
        .then(res => {
          client.release();
          response.setHeader("Content-Type", "application/json");
          response.send(JSON.stringify({ result: res.rows }));
        })
        .catch(e => {
          client.release();
          console.error(e);
          response.send("Error " + e);
        });
    });
  })
  .post("/api/add_book", function(request, response) {
    pool.connect().then(client => {
      const newUuid = uuidv4();
      console.log(request.body);
      var book = request.body.book;
      return client
        .query(
          `INSERT INTO public.books(
	              "bookName", "bookAuthor", "bookYear", "bookPrice", "bookID")
	              VALUES ($1, $2, $3, $4, $5);`,
          [
            book.bookName,
            book.bookAuthor,
            book.bookYear,
            book.bookPrice,
            book.bookID
          ]
        )
        .then(res => {
          client.release();
          response.setHeader("Content-Type", "application/json");
          response.send(JSON.stringify({ result: book.bookID }));
        })
        .catch(e => {
          client.release();
          console.error(e);
          response.send("Error " + e);
        });
    });
  })
  .post("/api/edit_book", function(request, response) {
    pool.connect().then(client => {
      console.log(request.body);
      var book = request.body.book;
      return client
        .query(
          `UPDATE public.books
	            SET "bookName"=$1, "bookAuthor"=$2, "bookYear"=$3, "bookPrice"=$4
	            WHERE "bookID" = $5 RETURNING "bookID";`,
          [
            book.bookName,
            book.bookAuthor,
            book.bookYear,
            book.bookPrice,
            book.bookID
          ]
        )
        .then(res => {
          client.release();
          response.setHeader("Content-Type", "application/json");
          response.send(JSON.stringify({ result: res.rows }));
        })
        .catch(e => {
          client.release();
          console.error(e);
          response.send("Error " + e);
        });
    });
  })
  .post("/api/delete_book", function(request, response) {
    pool.connect().then(client => {
      var bookID = request.body.bookID;
      return client
        .query(
          `DELETE FROM public.books
	              WHERE "bookID" = $1 RETURNING *;`,
          [bookID]
        )
        .then(res => {
          client.release();
          response.setHeader("Content-Type", "application/json");
          response.send(JSON.stringify({ result: res.rows }));
        })
        .catch(e => {
          client.release();
          console.error(e);
          response.send("Error " + e);
        });
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
