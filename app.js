var express = require('express');
var bodyParser = require('body-parser')
var requestify = require('requestify');
var sodium = require('sodium-native');
var app = express();

var host = 'https://bbvalabs.com:8001';

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('*', function(req, res) {
  console.log('GET');

  var url = host + req.url;
  console.log(url);

  console.log(req.headers);

  requestify.request(url, {
    method: 'GET',
    headers: req.headers
  })
    .then(function(response) {
      var headers = response.getHeaders();
      var body = response.getBody();

      console.log('##### RESPONSE #####');
      console.log(headers);
      console.log(body);
      res.set(headers)
      res.send(body);
    })
    .catch(function(err){
      console.log('Requestify Error', err);
      res.send(err.body);
    });
});

app.post('/tuyyo', function (req, res) {

  var nonce = new Buffer(sodium.crypto_secretbox_NONCEBYTES);
  var key = new Buffer(sodium.crypto_secretbox_KEYBYTES);
  var message = new Buffer(req.body.message);
  var cipher = new Buffer(message.length + sodium.crypto_secretbox_MACBYTES);

  sodium.randombytes_buf(nonce); // insert random data into nonce
  sodium.randombytes_buf(key);  // insert random data into key

  // encrypted message is stored in cipher.
  sodium.crypto_secretbox_easy(cipher, message, nonce, key);

  res.send({
    'message': cipher
  });
});

app.post('*', function(req, res) {
  console.log('POST');

  var url = host + req.url;
  console.log(url);

  req.headers['accept'] = '*/*';
  req.headers['user-agent'] = 'node/http-request-lib/v0.1';

  console.log('req.headers');
  console.log(req.headers);
  console.log('req.body');
  console.log(req.body);

  requestify.request(url, {
    method: 'POST',
    headers: req.headers,
    body: req.body
  })
    .then(function(response) {
      var headers = response.getHeaders();
      var body = response.getBody();

      console.log('##### RESPONSE #####');
      console.log(headers);
      console.log(body);
      res.set(headers)
      res.send(body);
    })
    .catch(function(err){
      console.log('Requestify Error', err);
      res.send(err.body);
    });
});

app.listen(3000, function () {
  console.log('Listening in port 3000...');
});