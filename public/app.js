// // Grab the articles as a json
// $.getJSON("/article", function (data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles")
//       .append('<input type="button" id="comment" value="Comment" />')
//       .append('<img src= "' + data[i].image + '">')
//       .append("<h6 data-id='" + data[i]._id + "'>" + data[i].title + "</h6>")
//       .append("<p>" + data[i].teaser + "<p/>")
//   }
// });
// Grab the articles as a json


$("#scrape").on("click", function () {
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).done(function (data) {
    console.log(data)
    window.location = "/"
  })
});
