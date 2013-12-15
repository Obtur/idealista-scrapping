var idealistaAPI = "http://www.idealista.com/labs/propertyMap.htm";
var results = [];
 
function search(numPage) {
    numPage = numPage || 1;
    jQuery.getJSON(idealistaAPI, {
            action: "json",
            operation: "A", // "V" Compra, "A" Alquiler
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
            numPage: numPage
    })
        .done(processResult);
}
 
function processResult(data) {
    
    console.log("actual page:" + data[1].actualPage);
    jQuery.each(data[1].elementList, function (i, item) {
        //results.push(item);
        sendToServer(item);
    });
    if (data[1].actualPage == 1) {
        for(var n=2; n < data[1].totalPages; n++) {
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