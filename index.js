//Változók és dependenciák
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var sendmail = require('sendmail')();
var app = express();
var prize5 = "";
var prize6 = "";
//App inicializálás
app.set('view engine', 'pug')
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
//Ötöslottó scrape
request("https://bet.szerencsejatek.hu/jatekok/otoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  var $ = cheerio.load(body);
  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize5 = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize5: " + prize5);
  });
});
//Hatoslottó scrape
request("https://bet.szerencsejatek.hu/jatekok/hatoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  var $ = cheerio.load(body);
  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize6 = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize6: " + prize6);
  });
});
//Ellenőrzés
function check() {
  if (prize5.includes('milliárd')){
    console.log("Prize5 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { message: 'Játszani kell!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5 + ', de a Hatoslottóé még csak ' + prize6 + '.' })
    })
  }
  if (prize6.includes('milliárd')){
    console.log("Prize6 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { message: 'Játszani kell!', subline: 'Az Hatoslottó eheti várható főnyereménye már ' + prize6 + ', de az Ötöslottóé még csak ' + prize5 + '.' })
    })
  }
  if (prize5.includes('milliárd') && prize6.includes('milliárd')){
    console.log("Prize5 and Prize6 are bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { message: 'Duplán játszani kell!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5 + ', és a Hatoslottóé is ' + prize6 + '.' })
    })
  } 
  else {
    console.log("Prizes are smaller than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Ejj, ráérünk arra még!',
      text: 'Az Ötöslottó eheti várható főnyereménye még csak ' + prize5 + ', a Hatoslottóé pedig ' + prize6 + '.',
    });
    app.get('/', function (req, res) {
      res.render('index', { message: 'Ejj, ráérünk arra még!', subline: 'Az Ötöslottó eheti várható főnyereménye még csak ' + prize5 + ', a Hatoslottóé pedig ' + prize6 + '.' })
    })
  }
}
check(prize5, prize6)
//Port figyelés
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})