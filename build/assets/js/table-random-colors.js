$(document).ready(function () {
  // Create an array of random colors
  var colors = ["#5b4da4", "#6b5fad", "#7c71b6", "#8c82bf", "#ada6d2", "#d2cee7"];

  // Iterate over all td elements in the table
  $(".randomTableColors.table td").each(function () {
    // Get a random color from the array
    var color = colors[Math.floor(Math.random() * colors.length)];

    // Set the background color of the td element to the random color
    $(this).css("color", color);
  });
});