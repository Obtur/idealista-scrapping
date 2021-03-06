var http = require('http');
var request = require('request');
var mongo = require('mongodb');
var fs = require('fs');
http.globalAgent.maxSockets = 20;

var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongo.Db('idealista', server);

var idealistaAPI = "http://www.idealista.com/labs/propertyMap.htm";
var results = [];
 
db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");

    var housings = db.collection('housings');
    search();
  }
});

function search(numPage) {
    queryString = {
            action: "json",
            operation: "V",
            radio: "40.4987200542489,-3.673553466796889",
            center: "40.38643994085133, -3.673553466796889",
            minPrice:0,
            minSize:0,
            since:"A",
            flat:true,
            penthouse:true,
            studio:true,
            duplex:true,
            chalet:true,           
            numPage: numPage,
            k : '1656605ceb135330fa6dc53f1df56354'
    };
    numPage = numPage || 1;
    request({ uri: idealistaAPI , qs: queryString, headers: { "User-Agent": "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410."}, maxRedirects:1}, 
    function(err, resp, body) {
        if (err) {
           console.log(err);
        } else if ( resp.statusCode == 200) {
            console.log(body);
            fs.writeFile(fileName,body);
        } else {
            console.log("HTTP STATUS : " + resp.statusCode);
            console.log(body);
        }
    });
}
 
function processResult(data) {
    
    console.log("actual page:" + data[1].actualPage);
    jQuery.each(data[1].elementList, function (i, item) {
        //results.push(item);
        sendToServer(item);
    });
    if (data[1].actualPage == 1) {
        for(var n=data[1].actualPage; n < data[1].totalPages; n++) {
            search(n);
        }
    } else if (data[1].actualPage == data[1].totalPages) {
        setTimeout(function() { 
            console.log("resultados: " + results.length);
            console.log("saved:" + saved );
        }, 5000);
    }
}
 
var saved = 0;
function sendToServer(item) {
    $.ajax({
      type: "POST",
      url: "http://localhost:5000/idealista",
      data: item,
      success: function() { saved+=1; },
      dataType: "json"
    });
}
 
search();