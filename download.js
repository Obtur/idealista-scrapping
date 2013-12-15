var http = require('http');
var request = require('request');
var mongo = require('mongodb');
var fs = require('fs');

http.globalAgent.maxSockets = 20;

var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongo.Db('idealista', server);
var filesToSave = 0;
db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");

	var housings = db.collection('housings_alquiler');
//	housings.find({munipality:"madrid",rooms:"1"}).toArray(function(err, results){
	housings.find({munipality:"madrid"}).toArray(function(err, results){
	    filesToSave = results.length;
		//for(i=300;i<400;i++) {
		for(i in results) {
			var id = results[i].url.replace(/.*inmueble./,'');
			// last version doesn't have inmueble in url, and last slash
			id = id.replace(/.*com./,'');
			if(id.slice(-1) == "/") {
				id = id.substr(0,id.length-1);
			}
			if(id != null && id != "null" && !isNaN(id)) {
				console.log("saving:"+id);
				saveHousing(id);
	    	} else {
	    		console.log("skipping empty id: " + id + " , objectId:" + results[i]._id);
	    		filesToSave-=1;
	    	}
	    }
    	exitWhenFinished();	
	});

  }
});

function saveHousing(id) {
	var fileName = 'housings_alquiler/'+id;

	fs.exists(fileName, function (exists) {
  		if(!exists) {
			var url = 'http://www.idealista.com/inmueble/'+id;
			request({ uri: url , headers: { "User-Agent": "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410."}, maxRedirects:1}, function(err, resp, body) {
			//request(url, function(err, resp, body) {
			    if (err) {
			       //throw err;
			       console.log(err);
			       filesToSave-=1;
			    } else if ( resp.statusCode == 200) {
			    	console.log("["+filesToSave+"] saved:"+id);
			    	fs.writeFile(fileName,body);
	    	    	filesToSave-=1;
			    } else if ( resp.statusCode == 404) {
			    	console.log("["+filesToSave+"] saved NOT FOUND:"+id);
			    	fs.writeFile(fileName,'');
	    	    	filesToSave-=1;
	    		} else {
	    			console.log("["+filesToSave+"] error getting file. STATUS:"+resp.statusCode+" id:"+id);
	    			filesToSave-=1;
	    		}
			});
		} else {
			console.log("["+filesToSave+"] exists:"+id);
		    filesToSave-=1;
		}
	});


}

function exitWhenFinished() {
	if(filesToSave==0) {
		process.exit(code=0);
	} else {
		setTimeout(exitWhenFinished,1000);
	}
}