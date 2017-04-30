
var express = require('express')
var request = require('request');
var cheerio = require('cheerio');
var app = express()
var prize_amount = [];
var regex = /[\d|,|.|e|E|\+]+/g;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Lottery prize checker')
})


request("https://bet.szerencsejatek.hu/jatekok/putto", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);

  var $ = cheerio.load(body);

  $('div.grid.game-details.top-banner-text').each(function( index ) {
    var prize = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize: " + prize);
    prize_amount = prize.match(regex);
  });
  prize_amount = prize_amount.replace( /,/g, "" );
  var prize_amount = parseInt("prize_amount");
  console.log("Prize amount: " + prize_amount);
  if (prize_amount>1000) {
    console.log("Prize is bigger than 1 billion");
  }

});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})