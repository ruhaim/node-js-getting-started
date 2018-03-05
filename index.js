const cool = require("cool-ascii-faces");
const express = require("express");
const pg = require("pg");
const path = require("path");
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');

const { Pool, Client } = require("pg");
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString
});

app = express()
  .use(express.static(path.join(__dirname, "public")))
  .use(bodyParser.json())
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .get("/cool", (req, res) => res.send(cool()))
  .get("/times", function(request, response) {
    var result = "";
    var times = process.env.TIMES || 5;
    for (i = 0; i < times; i++) result += i + " ";
    response.send(result);
  })
  .get("/db", function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query("SELECT * FROM public.books", function(err, result) {
        done();
        if (err) {
          console.error(err);
          response.send("Error " + err);
        } else {
          response.render("pages/db", { results: result.rows });
        }
      });
    });
  })

  .get("/api/get_booksp", function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query("SELECT * FROM public.books", function(err, result) {
        done();
        if (err) {
          console.error(err);
          response.send("Error " + err);
        } else {
          //response.render("pages/db", { results: result.rows });
          response.setHeader("Content-Type", "application/json");
          response.send(JSON.stringify({ result: result.rows }));
        }
      });
    });
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
  .get("/api/add_book", function(request, response) {
    pool.connect().then(client => {
      console.log(request.body);
      return client
        .query(
          `INSERT INTO public.books(
	              "bookName", "bookAuthor", "bookYear", "bookPrice", "bookID")
	              VALUES ($1, $2, $3, $4, $5) RETURNING bookID;`,
          ['some name', 'no name', 2016, 65.09, uuidv4()]
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
  .post("/api/edit_book", function(request, response) {
    pool.connect().then(client => {
      console.log(request.body);
      return client
        .query(
          `UPDATE public.books
	            SET "bookName"=$1, "bookAuthor"=$2, "bookYear"=$3, "bookPrice"=$4
	            WHERE "bookID" = $5;`,
          ["g", "ff", 45, 77, "id"]
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
  .get("/api/delete_book", function(request, response) {
    pool.connect().then(client => {
      return client
        .query(
          `DELETE FROM public.books
	              WHERE "bookID" = $1;`,
                ['bookid']
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

//SELECT * FROM public.books

//INSERT INTO public.books(
//"bookID", "bookName", "bookAuthor", "bookYear", "bookPrice")
//VALUES (?, ?, ?, ?, ?);

//Host
//ec2-54-243-239-66.compute-1.amazonaws.com
//Database
//d7ob7gfv5p3kcq
//User
//lodoogsrewuqnk
//Port
//5432
//Password
//f4bfa87e2c13e2ff246cd28baf9e8e828b5bf55763240756d217b099ecba510a
//URI
//postgres://lodoogsrewuqnk:f4bfa87e2c13e2ff246cd28baf9e8e828b5bf55763240756d217b099ecba510a@ec2-54-243-239-66.compute-1.amazonaws.com:5432/d7ob7gfv5p3kcq
//Heroku CLI
//heroku pg:psql postgresql-round-12981 --app sheltered-gorge-85466
