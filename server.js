// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var path = require("path");

// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
// var Article = require("./models/article.js");
// var Note = require("./models/note.js")


// Initialize Express
var app = express();
app.engine('handlebars', exphbs({ defaultLayout: "main" }), /*expressHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars)
})*/);
app.set('view engine', 'handlebars');

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

// Make public a static folder
app.use(express.static("public"));

// Hook mongojs configuration to the db variable
mongoose.connect("mongodb://mezamic000:n3wHou5e@ds221155.mlab.com:21155/heroku_pmkzcfvv");
// const db = mongoose.connection;
var Article = require("./models/article.js");
var Note = require("./models/note.js")


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
      result.title = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".title")
        .text();

      result.link = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .children("a")
        .attr("href");

      result.teaser = $(this)
        .children(".item-info-wrap")
        .children(".item-info")
        .children(".teaser")
        .text();

      result.image = $(this)
        .children(".item-image")
        .children(".imagewrap")
        .children("a")
        .children("img")
        .attr("src");

      // Create a new Article using the `result` object built from scraping
      Article.create(result)
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

app.get("/", function (req, res) {
  Article.find({ "saved": false }, function (err, articles) {
    var articleObject = {
      article: articles
    };
    if (err) {
      console.log(err)
    }
    console.log(articleObject);
    res.render("index", articleObject);
  }).lean();
});

app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for deleting Article by id
app.delete("/articles/delete/:id", function (req, res) {
  Article.findOneAndDelete({ _id: req.params.id }).lean()
    .then(function (dbArticle) {
      console.log("Article Deleted")
      res.json(dbArticle)
    })
    .catch(function (err) {
      res.json(err);
    });
})

//Route for clearing all scraped articles
app.delete("/articles/delete", function (req, res) {
  Article.deleteMany({}, function (res, err) {
    if (err) {
      console.log(err)
    }
    else {
      res.send("All articles cleared")
      console.log("All articles deleted")
    }
  })
})

//Route for getting all Comments
app.get("/comments", function (req, res) {
  Note.find({})
    .then(function (dbNote) {
      res.json(dbNote);
    })
    .catch(function (err) {
      res.json(err);
    })
});

//Route for deleting comment by id
app.delete("/comments/delete/:id", function (req, res) {
  Note.findOneAndDelete({ _id: req.params.id })
    .then(function (dbNote) {
      console.log("Comment Deleted")
      res.json(dbNote)
    })
    .catch(function (err) {
      res.json(err);
    });
})

// Listen on port 8080
var PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  console.log("App running on port 8080!");
});