function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Log");
}
