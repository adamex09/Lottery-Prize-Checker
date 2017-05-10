//Variables and dependencies
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var sendmail = require('sendmail')();
var schedule = require('node-schedule');
var pg = require('pg');
var app = express();
var prize5 = '';
var prize6 = '';
var date = new Date();
var NUMERIC_REGEXP = ;

//Database config
pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting users...');
  client
    .query('SELECT * FROM users;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});

//App start
app.set('view engine', 'pug')
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

//Lotto 5 scrape
request("https://bet.szerencsejatek.hu/jatekok/otoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  var $ = cheerio.load(body);
  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize5 = $(this).find('div.expected-price > h3').text().trim()
    console.log("Prize5-raw: " + prize5)
    if (prize5.includes('millió')) {
      prize5 = prize5.match(/[-]{0,1}[\d.]*[\d]+/g)
      console.log("Prize5: " + prize5)
    }
    else if (prize5.includes('milliárd')) {
      prize5 = prize5.match(/[-]{0,1}[\d.]*[\d]+/g)
      console.log("Prize5: " + prize5)
    }
  });
});

//Lotto 6 scrape
request("https://bet.szerencsejatek.hu/jatekok/hatoslotto/sorsolasok/", function(error, response, body) {
  if(error) {
    console.log("Error: " + error);
  }
  var $ = cheerio.load(body);
  $('div.grid.game-details.top-banner-text').each(function( index ) {
    prize6 = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize6-raw: " + prize6);
  });
});

//Prize checker
function prize_check() {
  if (prize5.includes('milliárd') && (!(prize6.includes('milliárd')))){
    console.log("Check: Prize5 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Játszani kell!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5 + ', de a Hatoslottóé még csak ' + prize6 + '.' })
    })
  }
  else if (prize6.includes('milliárd')  && (!(prize5.includes('milliárd')))){
    console.log("Check: Prize6 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Játszani kell!', subline: 'Az Hatoslottó eheti várható főnyereménye már ' + prize6 + ', de az Ötöslottóé még csak ' + prize5 + '.' })
    })
  }
  else if (prize5.includes('milliárd') && prize6.includes('milliárd')){
    console.log("Check: Prize5 and Prize6 are bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Duplán megéri!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5 + ', és a Hatoslottóé is ' + prize6 + '.' })
    })
  } 
  else {
    console.log("Check: Prizes are smaller than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'hourglass_empty', message: 'Ejj, ráérünk arra még!', subline: 'Az Ötöslottó eheti várható főnyereménye még csak ' + prize5 + ', a Hatoslottóé pedig ' + prize6 + '.' })
    })
  }
}
setTimeout(prize_check, 5000);

//Send emails
function send_emails() {
  if (prize5.includes('milliárd') && (!(prize6.includes('milliárd')))){
    console.log("Send: Prize5 is bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Játszani kell!',
      text: 'Az Ötöslottó főnyereménye már ' + prize5 + '!',
    });
  }
  else if (prize6.includes('milliárd')  && (!(prize5.includes('milliárd')))){
    console.log("Send: Prize6 is bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Játszani kell!',
      text: 'A Hatoslottó főnyereménye már ' + prize6 + '!',
    });
  }
  else if (prize5.includes('milliárd') && prize6.includes('milliárd')){
    console.log("Send: Prize5 and Prize6 are bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Duplán megéri!',
      text: 'Az Ötöslottó főnyereménye már ' + prize5 + ', és a Hatoslottónak is ' + prize6 + '!',
    });
  } 
  else {
    console.log("Send: Prizes are smaller than 1 billion");
  }
}

//Check scheduler
var j = schedule.scheduleJob({hour: 10, minute: 0, dayOfWeek: 1}, function(){
  console.log('Check scheduler is running!');
  prize_check();
});

//Email scheduler
//var j = schedule.scheduleJob({hour: 20, minute: 41, dayOfWeek: 3}, function(){
//  console.log(hour + 'h, email scheduler is running!');
//  send_emails();
//});

var rule = new schedule.RecurrenceRule();
rule.minute = 10;

var j = schedule.scheduleJob(rule, function(){
  var hour = date.getHours();
  var day = date.getDay();
  console.log(hour + 'h, email scheduler is running!');
  send_emails();
});

//Port listening
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

//Keep alive
var http = require("http");
setInterval(function() {
    http.get("http://lottery-prize-checker.herokuapp.com");
}, 1500000);