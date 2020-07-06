// Grab the articles as a json
$.getJSON("/article", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles")
      .append('<img src= "' + data[i].image + '">')
      .append("<h6 data-id='" + data[i]._id + "'>" + data[i].title + "</h6>")
      .append("<p>" + data[i].teaser + "<p/>")

  }
});
