idealista-scrapping
===================

Little project to scrape data from idealista API and improve it with a scrape form the html detail pages

### Installation

```
npm install
```

### Download data

Start local server to receive jsons
```
node app.js
```

Then go to http://www.idealista.com/labs/propertyMap.htm

Open Console F12

execute jqueryfy : 
```
var s=document.createElement('script');
s.setAttribute('src','//code.jquery.com/jquery.js');
document.getElementsByTagName('body')[0].appendChild(s);
```

copy chrome_snippet_to_download_list.js to console, and wait for all data to be saved in local idealista mondodb database

In the console log, it will inform about the page it's saving 

If you want to change the search area, play with radio and center parameters (do a similar search in the idealista map, and copy the parameters)

There will be a lot of housings with "null" id, try this query :
```
db.housings.aggregate({ $group : {_id : "$url", total : { $sum : 1 } } }, { $match : { total : { $gte : 2 } } }, { $sort : {total : -1} },  { $limit : 5 } );
{
	"result" : [
		{
			"_id" : "www.idealista.com/null",
			"total" : 10037
		}
	],
	"ok" : 1
}
```
Instead of url as id, we look for something more unique, try with aggregation until we find something reasonable
```
db.housings.aggregate({ $group : {_id : {url: "$url", userCode: "$userCode", price: "$price", latitude: "$latitude", longitude: "$longitude"}, total : { $sum : 1 } } }, { $match : { total : { $gte : 2 } } }, { $sort : {total : -1} },  { $limit : 15 } );
```

To remove duplicates we apply the following uniqueIndex :
```
db.housings.ensureIndex( { url: 1 , userCode: 1, price: 1, latitude: 1, longitude: 1}, { unique: true, dropDups: true } )
```

With this we get 40k total housings, and 10k with null value (we could not add extra info)
```
> db.housings.count()
42917
> db.housings.count({url:"www.idealista.com/null"})
10037
```

Stop node app.js server
```
run node download.js
```

If you reach the max requests by idealista, you can reexecute this script later, and it will download only the housings you don't have
This script will download all detail pages to housings/<id>
```
run node parse.js
```
This script will parse all detail pages in housings/<id> and create a housings/<id>.json file with the data from the item in mongodb and the extracted data from the html

Concatenate al json in a simple file to import it in mongo : 
```
for f in housings/*.json; do (cat "${f}"; echo) >> housings/ALL.json; done
```

Then import data to mongodb
```
mongoimport --db idealista --collection housings_extra housings/ALL.json 
connected to: 127.0.0.1
Sun Dec  1 21:08:48.300 check 9 3457
Sun Dec  1 21:08:48.300 imported 3457 objects
```

Then export it to csv format : 
```
mongoexport --db idealista --collection housings_extra --csv  --fieldFile fieldsFile --out housings/housings_extra.csv 
connected to: 127.0.0.1
exported 3457 records
```
and
```
mongoexport --db idealista --collection housings --csv  --fieldFile fieldsFile --out housings/housings_madrid.csv 
connected to: 127.0.0.1
exported 42917 records
```	



