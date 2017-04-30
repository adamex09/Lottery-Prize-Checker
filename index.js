
var express = require('express')
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app = express()


app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Lottery prize checker')
})


request("https://bet.szerencsejatek.hu/jatekok/otoslotto/sorsolasok", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);

  $('div.grid game-details top-banner-text').each(function( index ) {
    var prize = $(this).find('div.expected-price').text().trim();
    console.log("Prize: " + prize);
    fs.appendFileSync('prize.txt', prize);
  });

});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})