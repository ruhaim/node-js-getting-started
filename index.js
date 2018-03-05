const cool = require("cool-ascii-faces");
const express = require("express");
const pg = require("pg");
const path = require("path");
const PORT = process.env.PORT || 5000;

app = express()
  .use(express.static(path.join(__dirname, "public")))
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
