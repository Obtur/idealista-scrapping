var cheerio = require('cheerio');
var http = require('http');
var request = require('request');
var mongo = require('mongodb');
var fs = require('fs');

var server = new mongo.Server('localhost', 27017, {auto_reconnect: true});
var db = new mongo.Db('idealista', server);
var filesToSave = 0;
db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");

    var housings = db.collection('housings');
    housings.find({munipality:"madrid",rooms:"1"}).toArray(function(err, results){
        filesToSave = results.length;
        //for(i=1;i<10;i++) {
        for(i in results) {
            var id = results[i].url.replace(/.*inmueble./,'');
            // last version doesn't have inmueble in url, and last slash
            id = id.replace(/.*com./,'');
            if(id.slice(-1) == "/") {
                id = id.substr(0,id.length-1);
            }
            if(id != null && id != "null" && !isNaN(id)) {
                //console.log("saving:"+id);
                parseHousing(id,results[i]);
            } else {
                console.log("skipping empty id: " + id + " , objectId:" + results[i]._id);
                filesToSave-=1;
            }
        }
        exitWhenFinished(); 
    });

  }
});

function parseHousing(id, housing) {
    var data = fs.readFile(__dirname + '/housings/'+id, { encoding : 'utf8'}, function (err, data) {
        if (err) {
            console.log("["+filesToSave+"] not found:"+id);
            filesToSave-=1;
            //throw err;
        } else {
            console.log("["+filesToSave+"] parsing:"+id);
            $ = cheerio.load(data);
            housing.tipo = $('#detailsText .infoblock').eq(1).find('p').eq(0).text().trim().replace(/.*?\m² /,'').replace(/ - más detalles/g, '');
            housing.wc = $('#detailsText .infoblock').eq(1).find('p').eq(3).text().trim().replace(/ .*/g, '');
            housing.description = $('#fullDescription p').eq(0).text().trim();
            housing.caracteristicas = [];
            $('#detailsBottom .infoblock').eq(0).find('p').each(function() {
                housing.caracteristicas.push($(this).html());
            });
            housing.caracteristicas.pop(); // El ultimo sobra
            housing.distribucion = [];
            $('#detailsBottom .infoblock').eq(1).find('p').each(function() {
                housing.distribucion.push($(this).text().trim());
            })
            housing.distribucion.pop(); // El ultimo sobra
            ;housing.equipamiento = [];
            $('#detailsBottom .infoblock').eq(2).find('p').each(function() {
                housing.equipamiento.push($(this).text().trim());
            });
            housing.equipamiento.pop(); // El ultimo sobra
            // Después de procesar el scraping, intentamos sacar más datos de
            // las cadenas de texto, por ej el estado que siempre viene en la 2da pos
            housing.estado = housing.caracteristicas[1];
            // eficiencia energética
            if(housing.caracteristicas[2].indexOf('cert-energ') > 0) {
                housing.eficiencia = housing.caracteristicas[2].replace(/.*title="(.)".*/,"$1");
            } else {
                 housing.eficiencia = 'no indicado';
            }


            for (i in housing.caracteristicas) {
                var item = housing.caracteristicas[i];
                if(item.indexOf('estado') > -1) {
                    housing.estado = item;
                }
            }
            fs.writeFile('housings/'+id+".json",JSON.stringify(housing));
            filesToSave-=1;
        }
    });
    //console.log(housing);
}


function exitWhenFinished() {
    if(filesToSave==0) {
        process.exit(code=0);
    } else {
        setTimeout(exitWhenFinished,1000);
    }
}