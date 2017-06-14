//Dependencies
var express = require('express');
var app = express();
var port = 8080;
var router = require('./app/routes');
app.use('/', router);

//Set static files (css and image)public files locations
app.use(express.static(__dirname+'/public'));
//start the server
app.listen(port, function(){
  console.log('app started');
});
