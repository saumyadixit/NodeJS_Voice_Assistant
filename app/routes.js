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

var transcription;
//Test run for ajax callback
router.post('/speech', function(req, res){


       var txt = req.body.jsonData;
       console.log( txt );
       //console.log(txt["keyword"]);

       //var count =1;
       var input_file = "File"+(count-1)+".wav";
       var output_file = "File"+(count-1)+"_conv.wav";

           convert_format(input_file, output_file);

           setTimeout(function(){
               transcription = recognize_google(output_file);
               setTimeout(function(){
                   var usercommand = new Object();
                   usercommand.keyword = true;
                   usercommand.detected_text = transcription;
                   usercommand.intent = "unknown";
                      //
                      //Test time command
                      if(transcription.includes("time"))
                      {
                        usercommand.intent = "cur-time";
                      }
                      //
               res.send(JSON.stringify(usercommand));
             }, 2000);
           }, 2000);



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
          languageCode: 'en-US'
      };

      // Detects speech in the audio file
      speech.recognize(input_file, request)
            .then((results) => {
              transcription = results[0];
              console.log(`Transcription: ${transcription}`);
              return transcription;
            })
            .catch((err) => {
              console.error('ERROR:', err);
      });


      return transcription;
};
