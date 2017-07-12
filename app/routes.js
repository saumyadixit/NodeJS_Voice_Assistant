//Requires express
var express = require('express');
var path = require('path');
var url = require( "url" );
var queryString = require( "querystring" );
const linear16 = require('linear16');
//Create router object
var router = express.Router();
//Export our router
module.exports = router;
//Route for Home Page
router.get('/', function(req, res){
  res.render('pages/index')
});


var http = require('http');

var transcription;
var output_intent;
var input_file="File0"+".wav";
var output_file="File0"+"_conv.wav";

//Test run for ajax callback
router.post('/speech', function(req, res){

        var txt = req.body.jsonData;
        //console.log( txt );
        //var count =1;
        input_file = "File"+(count-1)+".wav";
        output_file = "File"+(count-1)+"_conv.wav";

        console.log('Calling conversion utility');
        //Conversion to linear16


        var conversion_complete = new Promise(
            function (resolve, reject){
              try {
                  var file =
                  {
                    inp_file: input_file
                  };
                  console.log(input_file);
                  console.log(output_file);
                  const params = {
                      input: input_file,
                      output: output_file
                  };

                  Promise.resolve(params)
                      .then(paths => {
                          return linear16(input_file, output_file);
                      })
                      .then(wavFile => {
                          //Conversion done
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


        conversion_complete
          .then(recognize_google)
          .then(get_intent)
          .then(function(fullfilled)
          {
            console.log("All Process Complete" + fullfilled);
            res.send(output_intent);
          })
          .catch(function (error) {
            // ops, mom don't buy it
            console.log(error.message);
	     // output: 'mom is not happy'
        });
});







//Speech recognition starts

var recognize_google = function(file){
  return new Promise(
      function(resolve,reject){
          console.log("Google Recognition Started ... "+output_file);
          var speech = require('@google-cloud/speech')({
              projectId: 'my-project-1479251894350',
              keyFilename: './VoiceRecog-6083eb45cc69.json'
          });

          const request = {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'en-US',
              speechContexts: {
                  'phrases':['Saumya','Dixit','Joydeep','Roy']
              }
          };

          // Detects speech in the audio file
          speech.recognize(output_file, request)
                .then((results) => {
                  transcription = results[0];
                  console.log("Google Speech Transcription Completed .. ");
                  console.log(`Transcription: ${transcription}`);
                  resolve(transcription);
                })
                .catch((err) => {
                  console.error('ERROR:', err);
          });

    }
);
};


//Make get call to Spring Boot

var get_intent = function(transcription){
  return new Promise(
    function (resolve,reject){

          console.log("Intent Processing started ... "+transcription);
          transcription=encodeURIComponent(transcription.trim());
          var optionsget = {
              host : 'localhost', // here only the domain name
              // (no http/https !)
              port : 4050,
              path : '/process?text='+transcription, // the rest of the url with parameters if needed
              method : 'POST' // do GET
          };

          console.info('Options prepared:');
          console.info(optionsget);
          console.info('Do the GET call');

          // do the GET request
          var reqGet = http.request(optionsget, function(res) {
              console.log("statusCode: ", res.statusCode);

              res.on('data', function(chunk) {
                  console.log('Spring Boot Call Processed .. ')
                  console.log('Output : ' + chunk);
                  output_intent=chunk;
                  resolve(chunk);
                  //process.stdout.write(d);
                  //console.info('\n\nCall completed');
              });

          });

          reqGet.end();
          reqGet.on('error', function(e) {
              console.error(e);
          });
          //return output_intent;
        }
);
};
