
var express = require('express');
var app = express();
var validUrl = require('valid-url');
var mongo = require('mongodb').MongoClient;
var dbUrl = 'mongodb://stepup2stepout:liris72259@ds155315.mlab.com:55315/urlshortener_ab';
app.use(express.static('public'));


app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/*", function (request, response) {
  var stringQuery = request.params[0];
  
  isUrl(stringQuery, response);
  });

function isUrl(stringQuery, response) {
  if( validUrl.isUri(stringQuery) ) {
    insertIntoDb(stringQuery);
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
function insertIntoDb( stringUrl ) {
  
  mongo.connect(dbUrl, (err, db) => {
  if(err) throw err;
  var collection = db.collection('urls');
  var json = {
      original_url: "test1",
      shortened_url: 'test2'
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
    response.json( doc );
  } )
  db.close();
  
}) 
  
}



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
