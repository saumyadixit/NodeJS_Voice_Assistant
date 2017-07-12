//Dependencies
var express = require('express');
var expressLayouts = require('express-ejs-layouts');

var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');


var key = fs.readFileSync('./cert/key-20170627-165927.pem');
var cert = fs.readFileSync('./cert/cert-20170627-165927.crt' );
var ca = fs.readFileSync( './cert/cert-key-20170627-165927.p12' );

//var sox = require('sox');
var outFile = 'InpFile';

var app = express();
var bodyParser = require('body-parser');
// parse an HTML body into a string
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var port = 8080;
var router = require('./app/routes');
app.use('/', router);

app.set('view engine','ejs');
app.use(expressLayouts);
//Set static files (css and image)public files locations
app.use(express.static(__dirname+'/public'));


//start the server
var options = {
  key: key,
  cert: cert,
  ca: ca
};


var https = require('https');
httpsServer = https.createServer(options, app);
httpsServer.listen(port, '0.0.0.0', function() {
    console.log('Listening to port:  ' + port);
});


var http = require('http');


//BinaryServer code starts


binaryServer = BinaryServer(
  {
    server: httpsServer
  });
count = 0;
binaryServer.on('connection', function(client) {
  console.log('new connection');
  var outFile = "File"+count+".wav";
  count++;
  var fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });
  client.on('stream', function(stream, meta) {
      console.log('new stream');
      stream.pipe(fileWriter);

      stream.on('end', function() {
          fileWriter.end();
          console.log('wrote to file ' + outFile);

    });
      stream.on('error',function(err){
        console.log(err);
      });
  });
});
