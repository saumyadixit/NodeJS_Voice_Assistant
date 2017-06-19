//Dependencies
var express = require('express');
var expressLayouts = require('express-ejs-layouts');

var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');
//var sox = require('sox');
var outFile = 'demo.wav';

var app = express();
var port = 8080;
var router = require('./app/routes');
app.use('/', router);

app.set('view engine','ejs');
app.use(expressLayouts);
//Set static files (css and image)public files locations
app.use(express.static(__dirname+'/public'));
//start the server

app.listen(port, '0.0.0.0', function() {
    console.log('Listening to port:  ' + port);
});


binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');
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
/*
          var sox = require('sox');

          // these options are all default, you can leave any of them off
          var job = sox.transcode('demo.wav', 'dest.mp3', {
            sampleRate: 44100,
            format: 'mp3',
            channelCount: 2,
            bitRate: 192 * 1024,
            compressionQuality: 5, // see `man soxformat` search for '-C' for more info
          });
          job.on('error', function(err) {
            console.log(err);
          });
          job.on('progress', function(amountDone, amountTotal) {
            console.log("progress", amountDone, amountTotal);
          });
          job.on('src', function(info) {
              console.log(info);

          });
          job.on('dest', function(info) {
            console.log(info);

          });
          job.on('end', function() {
            console.log("all done");
          });
          job.start();
/*
          var speech = require('@google-cloud/speech')({
              projectId: 'my-project-1479251894350',
              keyFilename: './VoiceRecog-6083eb45cc69.json'
          });

          const request = {
              encoding: 'FLAC',
              sampleRateHertz: 16000,
              languageCode: 'en-US'
          };

          // Detects speech in the audio file
          speech.recognize('temp.flac', request)
                .then((results) => {
                  const transcription = results[0];
                  console.log(`Transcription: ${transcription}`);
                })
                .catch((err) => {
                  console.error('ERROR:', err);
          });

*/

    });
      stream.on('error',function(err){
        console.log(err);
      });
  });
});
