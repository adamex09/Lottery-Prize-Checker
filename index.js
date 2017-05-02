
var express = require('express')
var request = require('request');
var cheerio = require('cheerio');
var app = express()
var prize = "";

app.set('view engine', 'pug')
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

request("https://bet.szerencsejatek.hu/jatekok/otoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);

  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize: " + prize);
  });
  if (prize.includes('milliárd')) {
    console.log("Prize is bigger than 1 billion");
  } 
  else {
    console.log("Prize is smaller than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { title: 'Hey', message: 'Hello there!' })
    })
  }

});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})