
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
  
  response.json( isUrl(stringQuery) );
  });

function isUrl(stringQuery) {
  if( validUrl.isUri(stringQuery) ) {
    console.log("goodurl");
    insertIntoDb(stringQuery);
    return {
      original_url: stringQuery,
      shortened_url: 'test2'
      }
  } else {
    return {
      error: "Query doesn't follow the http://www.example.com format."
    }
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
      original_url: stringUrl,
      shortened_url: 'test2'
      }
  collection.update(
    json, json, { upsert: true }
  )
  db.close();
  
}) 
}

function getFromDb( url ) {
    mongo.connect( dbUrl, (err, db) => {
      if(err) {throw err}
      else {
        var collection = db.collection('urls');
        return collection.find();
      }
      
    } )
  
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
