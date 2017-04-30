'use strict';

const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const fetch = require('node-fetch');
const request = require('request');

// Webserver parameter
var port = process.env.PORT || 8000
server.listen(port, function() {
    console.log("App is running on port " + port);
});


// Starting our webserver and putting it all together
const app = express();
app.use(({method, url}, rsp, next) => {
  rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${method} ${url}`);
  });
  next();
});
app.use(bodyParser.json({ verify: verifyRequestSignature }));

// Index route
app.get('/', function (req, res) {
    res.send('Hi, I am a lottery prize checker. Up and running!')
})



app.listen(PORT);
console.log('Listening on :' + PORT + '...');