
var express = require('express');
var app = express();
var validUrl = require('valid-url');
var shortid = require('shortid');
var mongo = require('mongodb').MongoClient;
var dbUrl = 'mongodb://stepup2stepout:liris72259@ds155315.mlab.com:55315/urlshortener_ab';
var count = 1;
var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var base = alphabet.length; // base is the length of the alphabet (58 in this case)

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/:id", function (request, response) {
  var id = request.params.id;
  
  getShort(id, response, request);
  });

app.get("/new/*", function (request, response) {
  var stringQuery = request.params[0];
  
  isUrl(stringQuery, response, request);
  });

function isUrl(stringQuery, response, request) {
  if( validUrl.isUri(stringQuery)) {
      insertIntoDb(stringQuery, request);
      getFromDb(stringQuery, response);
  } else {
      response.json(
      {
        error: "Query doesn't follow the http://www.example.com format."
      }
    );
  }
}

/*
* @param: stringUrl: Url taken in from the query in the address bar
* Description: If the url is not in the collection, the url will be updated instead of inserting a duplicate. 
*/
function insertIntoDb( stringUrl, request ) {
  
  mongo.connect(dbUrl, (err, db) => {
  if(err) throw err;
  var collection = db.collection('urls');
  var json = { 
      count: +count++,
      original_url: stringUrl,
      shortened_url: request.protocol + "://" +request.get('host') +"/" +shortid.generate() 
      }
  collection.update(
    json, json, { upsert: true }
  );
  db.close();
  
}) 
}

/*
* @param: stringQuery : The user's entered URL
* @param response: HTTP resposne to the server
* Description: Find the URL from the collection 'urls' and send a response to he server in json format
*/
function getFromDb( stringQuery, response ) {
  mongo.connect(dbUrl, (err, db) => {
  if(err) throw err;
  var collection = db.collection('urls');
  
  collection.findOne( {original_url: stringQuery} , function(err, doc) {
      response.send( doc );
    } );
  db.close();
  
}) 
  
}

/*
*
*/

function getShort( stringQuery, response, request ) {
  mongo.connect(dbUrl, (err, db) => {
  if(err) {
    throw err;
    db.close();
  } else {
    var collection = db.collection('urls');
  
    collection.findOne( {shortened_url: request.protocol + "://" +request.get('host') +"/" +stringQuery} , function(err, doc) {
      response.redirect( doc.original_url );
    } )
    db.close();
    }
 });
  
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
 