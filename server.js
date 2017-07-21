//Adding Express support to Node Site
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
//Initialize BinaryServer for binary audio streaming from front end
var BinaryServer = require('binaryjs').BinaryServer;
//Initialize FS for handling writing of audio to file
var fs = require('fs');
//Initialize WAV plugin for handling wav encoding
var wav = require('wav');

console.log("Loading server.js");


var outFile = 'InpFile';

//Create Instance of express
var app = express();
//Initialize body-parser for parsing JSON data body in AJAX request from front end
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var port = 8080; // App will listen to https requests on port 8080
var router = require('./app/routes'); //Include routes.js file
app.use('/', router); // Set Home directory

app.set('view engine','ejs');
app.use(expressLayouts);
//Set static files public files locations
app.use(express.static(__dirname+'/public'));

//Initialize Keys and Certificates for authentication of HTTPS protocol
//Reference to generate SSH key : https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/
var key = fs.readFileSync('./cert/key-20170627-165927.pem');
var cert = fs.readFileSync('./cert/cert-20170627-165927.crt' );
var ca = fs.readFileSync( './cert/cert-key-20170627-165927.p12' );

//Define authentication options for the HTTPS server
var options = {
  key: key,
  cert: cert,
  ca: ca
};

//Initialize and create HTTPS server
var https = require('https');
httpsServer = https.createServer(options, app);
httpsServer.listen(port, '0.0.0.0', function() {
    console.log('Listening to port:  ' + port);
});


//Initialize HTTP
var http = require('http');

//BinaryServer Initialization on HTTPS server as base
binaryServer = BinaryServer(
  {
    server: httpsServer
  });
//Initialize File Count to 0 when server is started
count = 0;
//On New Binary Connection
binaryServer.on('connection', function(client) {
  console.log('new connection');
  //Increase File Count on each new request
  var outFile = "File"+count+".wav";
  count++;
  //Initialize new WAV File Writer with below properties
  var fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });
  //On Stream of Binary Audio Data from Front End to NodeJS
  client.on('stream', function(stream, meta) {
      console.log('new stream');
      //Pipe the input data to File writer, so that it keeps writing the audio from microphone to the wav file
      stream.pipe(fileWriter);
      //On end of Stream from Front End to NodeJS
      stream.on('end', function() {
          //Close File Writer Object
          fileWriter.end();
          console.log('wrote to file ' + outFile);

    });
        //On Error Log the Error
      stream.on('error',function(err){
        console.log(err);
      });
  });
});
