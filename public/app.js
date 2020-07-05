// Grab the articles as a json
$.getJSON("/article", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].teaser + "<br />" + '<img src= "' + data[i].image + '">' + "<br />" + "</p>");
  }
});
