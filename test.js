var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var file = fs.readFileSync(__dirname + '/housings/26534538', { encoding : 'utf8'});

housings = {
    //'Aloha': 26315329,
    'Beaverton': 566656
};
/*
for (housing in housings) {
    var url = 'http://www.idealista.com/inmueble/' + housings[housing];
    request(url, function(err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        console.log(housing + body);
        // TODO: scraping goes here!
    });
}
*/

$ = cheerio.load(file);
var housing = {};
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
console.log(housing);