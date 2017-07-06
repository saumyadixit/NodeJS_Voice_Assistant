//Requires express
var express = require('express');
var path = require('path');
var url = require( "url" );
var queryString = require( "querystring" );

//Create router object
var router = express.Router();
//Export our router
module.exports = router;
//Route for Home Page
router.get('/', function(req, res){
  //res.send('Hello World');
  res.render('pages/index')
});

//Test run for ajax callback
router.post('/search', function(req, res){


       var txt = req.body;
       console.log( txt );
       var credentials = new Object();
       credentials.username = "Joydeep";
       credentials.password = "Test";

   res.send(JSON.stringify(credentials));
   //MySearch.doSearch(search_form,function(err,items) {
   //     res.send(items);
   //});
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
