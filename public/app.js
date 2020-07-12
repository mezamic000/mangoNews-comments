$("#scrape").on("click", function () {
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).done(function (data) {
    console.log(data)
    window.location = "/"
  })
});

$("#clear").on("click", function () {
  $.ajax({
    method: "DELETE",
    url: "/articles/delete"
  }).done(function () {
    window.location = "/"
  })
})

$("#save-comment").on("click", function () {
  var thisId = $(this).attr("data-id");
  var thisTitle = $(this).attr("title");
  var commentor = $("#commentor").val()
  var comment = $("#comment").val()
  $.post("/articles/" + thisId, {
    commentor: commentor,
    comment: comment
  },
    function () {
      window.location = "/comments"
    })
  console.log(comment)
})