//Requires express for express layout
var express = require('express');
var path = require('path');
var url = require( "url" );
var queryString = require( "querystring" );
console.log("Loading routes.js");
//Initialize linear16 plugin for conversion of audio to linear16 format from WAV
const linear16 = require('linear16');
//Create router object
var router = express.Router();
//Export our router
module.exports = router;
//Define Route for Home Page
router.get('/', function(req, res){
  //On get request render index.ejs page
  res.render('pages/index')
});

//Initialize HTTP for interacting with Spring Boot NLP server over HTTP
var http = require('http');

//Transcription from Google Speech API
var transcription;
//Output Intent
var output_intent;
//Initialize file names for original recorder WAV file and the converted LINEAR16 file
var input_file="File0"+".wav";
var output_file="File0"+"_conv.wav";

//Handle Post Request from Front End to /speech URL. This request
router.post('/speech', function(req, res){
        //Extract jsonData from request body
        var txt = req.body.jsonData;
        input_file = "File"+(count-1)+".wav";
        output_file = "File"+(count-1)+"_conv.wav";

        console.log('Calling conversion utility');
        //Conversion to linear16

        //Create new promise for File Conversion
        var conversion_complete = new Promise(
            function (resolve, reject){
              try {
                  //Set File
                  var file =
                  {
                    inp_file: input_file
                  };
                  //Debug lof the input and output file
                  console.log(input_file);
                  console.log(output_file);
                  //Set the parms as the input and output file
                  const params = {
                      input: input_file,
                      output: output_file
                  };
                  //Resolve the parms
                  Promise.resolve(params)
                      //On File exists
                      .then(paths => {
                          //Convert and return file
                          return linear16(input_file, output_file);
                      })
                      .then(wavFile => {
                          //Conversion is complete now, resolve the conversion_complete promise
                          resolve(file);
                          console.log("File Conversion Completed .. ");
                      })
                      .catch(err => console.error(err));
              } catch (err) {
                  reject("Error");
                  console.error(err);
              }
        });

        //Conversion to linear16 complete
        //In NodeJS the javascript functions are asynchronous, so promises are way to make them work synchronously
        //Use all the promises created
        //Call conversion_complete function
        conversion_complete
          //on resolved call promise function recognize_google
          .then(recognize_google)
          //on resolved call promise function get_intent
          .then(get_intent)
          //on completion of get_intent send the output_intent JSON to the front end
          .then(function(fullfilled)
          {
            console.log("All Process Complete" + fullfilled);
            //Send data to Result object to front end
            res.send(output_intent);
          })
          .catch(function (error) {
            // ops, mom don't buy it
            console.log(error.message);
	     // output: 'mom is not happy'
        });
});

//Define Speech recognition function promise
var recognize_google = function(file){
  return new Promise(
      function(resolve,reject){
          console.log("Google Recognition Started ... "+output_file);
          //Initialize the project name for Google Cloud in projectId
          //Set location of authentication key JSON in keyFilename
          var speech = require('@google-cloud/speech')({
              projectId: 'my-project-1479251894350',
              keyFilename: './VoiceRecog-6083eb45cc69.json'
          });

          //Initialize properties of request object
          const request = {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'en-US',
              speechContexts: {
                  'phrases':['Saumya','Dixit'] // Pass context phrases for more accurate conversion
              }
          };

          // Detects speech in the audio file. Call the recognise function for the last output file and pass the request object
          speech.recognize(output_file, request)
                .then((results) => {
                  //Get the first Transcription
                  transcription = results[0];
                  //We can process all the possible transcriptions as part of enhancement
                  console.log("Google Speech Transcription Completed .. ");
                  console.log(`Transcription: ${transcription}`);
                  //Resolve recognize_google promise
                  resolve(transcription);
                })
                .catch((err) => {
                  console.error('ERROR:', err);
          });

    }
);
};


//Initialize function get_intent. This function is called on receiving AJAX request for intent analysis from front end (If keyword detected)

var get_intent = function(transcription){
  return new Promise(
    function (resolve,reject){

          console.log("Intent Processing started ... "+transcription);
          transcription=encodeURIComponent(transcription.trim());
          var optionsget = {
              host : 'localhost', // The domain name of Spring Boot Server (Localhost as its running currently on the same server as NodeJS)
              port : 4050, // Set port of Spring Boot Server
              path : '/process?text='+transcription, // Pass the transcription from Google Speech API
              method : 'POST' // Do a POST request
          };

          //Logging some debug info
          console.info('Options prepared:');
          console.info(optionsget);
          console.info('Do the GET call');

          //Do the GET request over HTTP with options as defined in optionsget
          var reqGet = http.request(optionsget, function(res) {
              console.log("statusCode: ", res.statusCode);
              //On receiving result from Spring Boot Server
              res.on('data', function(chunk) {
                  console.log('Spring Boot Call Processed .. ');
                  //Log the output JSON from Spring Boot Server
                  console.log('Output : ' + chunk);
                  output_intent=chunk;
                  //Mark promise as resolved for Intent Processing using Spring Boot NLP server
                  resolve(chunk);

              });

          });

          reqGet.end();
          reqGet.on('error', function(e) {
              console.error(e);
          });

        }
);
};
