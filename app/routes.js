//Requires express
var express = require('express');
var path = require('path');
//Create router object
var router = express.Router();
//Export our router
module.exports = router;
//Route for Home Page
router.get('/', function(req, res){
  //res.send('Hello World');
  res.render('pages/index')
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
