var express = require("express");
var app = express();
//var mongoose = require( 'mongoose' );
//var housingSchema = new mongoose.Schema({ any: {} });
//mongoose.model('Housing', housingSchema );
//Housing = mongoose.model('Housing')
//db = mongoose.connect( 'mongodb://localhost/idealista' );
 
var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('idealista', server);
db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
// retrieve a collection reference
var housings;
db.collection('housings_alquiler', function(err, housingsRef) { 
    housings = housingsRef;
});
 
//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
 
    next();
}
 
app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(allowCrossDomain);
  // Static Content
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});
 
app.get('/', function(request, response) {
  response.send('Hello World!');
});
 
app.post('/idealista', function(request, response) {
 console.log(request.body);
 //var housing = new Housing(request.body);
 //housing.save();
 housings.insert(request.body)
 response.send(request.body);
});
 
 
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});