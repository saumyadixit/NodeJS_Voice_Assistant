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
//Test run for ajax callback
router.post('/speech', function(req, res){


       var txt = req.body.jsonData;
       console.log( txt );
       //console.log(txt["keyword"]);

       //var count =1;
       var input_file = "File"+(count-1)+".wav";
       var output_file = "File"+(count-1)+"_conv.wav";

           convert_format(input_file, output_file);
           transcription ="";
           setTimeout(function(){
               transcription = recognize_google(output_file);
               setTimeout(function(){
                 output_intent = get_intent(transcription);
                 setTimeout(function(){
                    res.send(output_intent);
               }, 5000);
             }, 10000);
           }, 5000);



});


//Route for our contact page
router.get('/Info', function(req, res){
  res.render('pages/about')
});

router.get('/contact', function(req, res){
  res.render('pages/contact')
});
router.post('/contact', function(req, res){

});


//Make get call to Spring Boot

function get_intent(transcription){
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
            return chunk;
            //process.stdout.write(d);
            //console.info('\n\nCall completed');
        });

    });

    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
    });
    return output_intent;
}

//Conversion to linear16


function convert_format(input_file, output_file){
      var wait=true;
      try {

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
                  wait = false;
                  console.log("File Conversion Completed .. ");
              })
              .catch(err => console.error(err));


      } catch (err) {

          console.error(err);
      }



      //Conversion to linear16 complete
};


//Speech recognition starts

function recognize_google(input_file){
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
      speech.recognize(input_file, request)
            .then((results) => {
              transcription = results[0];
              console.log("Google Speech Transcription Completed .. ");
              console.log(`Transcription: ${transcription}`);
              return transcription;
            })
            .catch((err) => {
              console.error('ERROR:', err);
      });


      return transcription;
};
