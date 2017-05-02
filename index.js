
var express = require('express')
var request = require('request');
var cheerio = require('cheerio');
var app = express()
var prize5 = "";
var prize6 = "";

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
    prize5 = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize5: " + prize5);
  });
});

request("https://bet.szerencsejatek.hu/jatekok/hatoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  console.log("Status code: " + response.statusCode);
  var $ = cheerio.load(body);
  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize6 = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize6: " + prize6);
  });
});

function check(prize5, prize6) {
  if (prize5.includes('milliárd') || prize6.includes('milliárd')){
    console.log("Prize is bigger than 1 billion");
  } 
  else {
    console.log("Prize is smaller than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { message: 'Ejj, ráérünk arra még!', prize: 'Az Ötöslottó eheti várható főnyereménye még csak '+ prize5 +', a Hatoslottóé pedig ' + prize6})
    })
  }
}

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})