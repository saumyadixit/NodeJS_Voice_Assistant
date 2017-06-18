//Dependencies
var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var port = 8080;
var router = require('./app/routes');
app.use('/', router);

app.set('view engine','ejs');
app.use(expressLayouts);
//Set static files (css and image)public files locations
app.use(express.static(__dirname+'/public'));
//start the server

app.listen(port, function(){
  console.log('app started');
});
/*
// Google Speech

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
  speech.recognize('./Power_English_Update.flac', request)
    .then((results) => {
      const transcription = results[0];

      console.log(`Transcription: ${transcription}`);
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
*/
