var 
	fs = require('fs'),
    request = require('request');
	
var pesquisa = "amazonia brasil";
var zoom= 13;
var limiteApi=10;
var pastaDownload = "imagens/";
var quantidadeImpressa=0;
var url = encodeURI("http://maps.google.com/maps/api/geocode/json?address="+pesquisa+"&sensor=false");

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        var bounds = body.results[0].geometry.bounds;
		
		var northeast = bounds.northeast;
		var southwest = bounds.southwest;
		//console.log(northeast.lat);
		//console.log(southwest.lat);
		
		//var location = body.results[0].geometry.location; //deletar
		
		var nowLat=northeast.lat,nowLng=northeast.lng;
		//getImage(location.lat,location.lng);
		//getImage(location.lat,location.lng+getZoomDifference(zoom));
		
		//console.log(northeast.lng+" "+northeast.lat);
		//console.log(southwest.lng+" "+southwest.lat);
		while(nowLat>=southwest.lat){
			nowLng=northeast.lng;
			while(nowLng>=southwest.lng&&quantidadeImpressa<limiteApi){
				getImage(nowLat,nowLng);
				nowLng-=getZoomDifference(zoom);
			}
			nowLat-=getZoomDifference(zoom);
		}
		console.log("Quantidade de imagens baixadas = "+quantidadeImpressa);
		
    }
})


function getImage(lat,lng){
	var urlImage = encodeURI("http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&size=640x640&maptype=satellite&zoom="+zoom+"&format=jpg");
	console.log(urlImage);
	
	quantidadeImpressa++;
	nomeArquivo = pastaDownload+quantidadeImpressa+'.jpg';
	download(urlImage,nomeArquivo);
	
	
	
	
	
}

function getZoomDifference(zoom){
	var distance = 360;
	for(x=1;x<zoom;x++){
		distance = distance/2;
	}
	return distance;
}




download = function(uri, filename){
  request.head(uri, function(err, res, body){

    request(uri).pipe(fs.createWriteStream(filename)).on('close',
		function(){console.log(filename+" OK!");}
	);
  });
};