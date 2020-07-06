// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

// Make public a static folder
app.use(express.static("public"));

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {

  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.npr.org/sections/news/").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $("article").each(function (i, element) {
      var result = {}; //empty result object

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".title")
        .text();

      result.link = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .children("a")
        .attr("href");

      result.teaser = $(element)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .text();

      result.image = $(element)
        .children(".item-image")
        .children(".imagewrap")
        .children("a")
        .children("img")
        .attr("src");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle)
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err)
        })
    });
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
  });
});

app.get("/article", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(8080, function () {
  console.log("App running on port 8080!");
});