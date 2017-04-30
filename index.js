'use strict';

const bodyParser = require('body-parser');

// Webserver parameter
const PORT = process.env.PORT || 8445;


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