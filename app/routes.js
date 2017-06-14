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
  res.sendFile(path.join(__dirname,'../index.html'))
});

//Route for our contact page
router.get('/Info', function(req, res){
  res.send('I am in info page');
});

router.get('/contact')
router.post('/contact');
