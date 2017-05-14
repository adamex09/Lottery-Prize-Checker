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
var prize5raw = '';
var prize6raw = '';
var date = new Date();
var hour = date.getHours();
var day = date.getDay();

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
    prize5raw = $(this).find('div.expected-price > h3').text().trim()
    console.log("Prize5raw: " + prize5raw)
    if (prize5raw.includes('millió')) {
      prize5 = prize5raw.match(/[-]{0,1}[\d.]*[\d]+/g);
      prize5 = prize5.join();
      if (prize5.includes(',')) {
        prize5 = prize5.substring(0, prize5.indexOf(','));
      };
      console.log("Prize5: " + prize5);
    }
    else if (prize5raw.includes('milliárd')) {
      prize5 = prize5raw.match(/[-]{0,1}[\d.]*[\d]+/g);
      prize5 = prize5.join();
      prize5 = Number(prize5.replace(',','.')) * 1000;
      console.log("Prize5: " + prize5);
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
    prize6raw = $(this).find('div.expected-price > h3').text().trim();
    console.log("Prize6raw: " + prize6raw);
    if (prize6raw.includes('millió')) {
      prize6 = prize6raw.match(/[-]{0,1}[\d.]*[\d]+/g);
      prize6 = prize6.join();
      if (prize6.includes(',')) {
        prize6 = prize6.substring(0, prize6.indexOf(','));
      };
      console.log("Prize6: " + prize6);
    }
    else if (prize6raw.includes('milliárd')) {
      prize6 = prize6raw.match(/[-]{0,1}[\d.]*[\d]+/g)
      prize6 = prize6.join()
      prize6 = Number(prize5.replace(',','.')) * 1000;
      console.log("Prize6: " + prize6);
    }
  });
});

//Prize checker
function prize_check() {
  if ((prize5 > 1000) && (prize6 < 1000)){
    console.log("Check: Prize5 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Játszani kell!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5raw + ', de a Hatoslottóé még csak ' + prize6raw + '.' })
    })
  }
  else if ((prize6 > 1000)  && (prize5 < 1000)){
    console.log("Check: Prize6 is bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Játszani kell!', subline: 'Az Hatoslottó eheti várható főnyereménye már ' + prize6raw + ', de az Ötöslottóé még csak ' + prize5raw + '.' })
    })
  }
  else if ((prize5 > 1000) && (prize6 > 1000)){
    console.log("Check: Prize5 and Prize6 are bigger than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'notifications_active', message: 'Duplán megéri!', subline: 'Az Ötöslottó eheti várható főnyereménye már ' + prize5raw + ', és a Hatoslottóé is ' + prize6raw + '.' })
    })
  } 
  else {
    console.log("Check: Prizes are smaller than 1 billion");
    app.get('/', function (req, res) {
      res.render('index', { icon: 'hourglass_empty', message: 'Ejj, ráérünk arra még!', subline: 'Az Ötöslottó eheti várható főnyereménye még csak ' + prize5raw + ', a Hatoslottóé pedig ' + prize6raw + '.' })
    })
  }
}
setTimeout(prize_check, 5000);

//Send emails
function send_emails() {
  pg.defaults.ssl = true;
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;
    console.log('Connected to postgres! Getting users...');
    client.query('SELECT * FROM users WHERE day = '+day+' AND hour = '+hour+' AND (prize <= '+prize5+' OR prize <='+prize6+')', function(err, result) {
      for (var i = 0; i < (Object.keys(result.rows).length)/6; i++) {
      console.log('name: %s and email: %s', result.rows[i].name, result.rows[i].email);
        sendmail({
          from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
          to: result.rows[i].email,
          subject: 'Játszani kell!',
          text: 'Az Ötöslottó főnyereménye már ' + prize5raw + '!',
        });
      }
    });
  });
}

//Send emails
/*function send_emails() {
  if ((prize5 > 1000) && (prize6 < 1000)){
    console.log("Send: Prize5 is bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Játszani kell!',
      text: 'Az Ötöslottó főnyereménye már ' + prize5raw + '!',
    });
  }
  else if ((prize6 > 1000)  && (prize5 < 1000)){
    console.log("Send: Prize6 is bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Játszani kell!',
      text: 'A Hatoslottó főnyereménye már ' + prize6raw + '!',
    });
  }
  else if ((prize5 > 1000) && (prize6 > 1000)){
    console.log("Send: Prize5 and Prize6 are bigger than 1 billion");
    sendmail({
      from: 'Lottónyeremény Ellenőr <lottery-prize-checker@herokuapp.com>',
      to: 'hello@adamhornyak.com',
      subject: 'Duplán megéri!',
      text: 'Az Ötöslottó főnyereménye már ' + prize5raw + ', és a Hatoslottónak is ' + prize6raw + '!',
    });
  } 
  else {
    console.log("Send: Prizes are smaller than 1 billion");
  }
}*/

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
rule.minute = 47;

var j = schedule.scheduleJob(rule, function(){
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