var
	fs = require('fs'),
    request = require('request');

var pesquisa = "campinas"; //variável da pesquisa, mude isso para escolher onde cada coisa vai ser baixada
var zoom= 18; //nível de zoom da API, onde o nível 1 mostra a terra toda, o nivel 2 mostra a metade e assim recursivamente
var limiteApi=2200; //limite de imagens que podem ser baixadas na API do google (o padrão é 10000, mas você pode querer apenas algumas)
var pastaDownload = "imagens/"; //pasta onde as imagens serão baixadas



var quantidadeImpressa;
var url = encodeURI("http://maps.google.com/maps/api/geocode/json?address="+pesquisa+"&sensor=false");
if (!fs.existsSync(pastaDownload)) {
	if(fs.mkdirSync(pastaDownload)){
		console.log("Pasta de imagens criada.");
	}
}
quantidadeImpressa = 0;



request({
    url: url,
    json: true
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
			var northeast = body.results[0].geometry.bounds.northeast;
      var southwest = body.results[0].geometry.bounds.southwest;
			var nowLat=northeast.lat,nowLng=northeast.lng;
			while(nowLat>=southwest.lat){
				nowLng=northeast.lng;
				while(nowLng>=southwest.lng&&quantidadeImpressa<limiteApi){

					quantidadeImpressa++;
					nomeArquivo = pastaDownload+quantidadeImpressa+'.jpg';
					if (!fs.existsSync(nomeArquivo)) {
						getImage(nowLat,nowLng,nomeArquivo);
					}else{
						console.log('File '+nomeArquivo+' already exists!');
						checkFile(nomeArquivo);
					}



					nowLng-=getDistance(zoom);
				}
				nowLat-=getDistance(zoom);
			}
			console.log("Quantidade de imagens baixadas = "+quantidadeImpressa);
    }
})

//função para gerar a URL da imagem e enviar para a função de download
function getImage(lat,lng,nomeArquivo){
	var urlImage = encodeURI("http://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lng+"&size=640x640&maptype=satellite&zoom="+zoom+"&format=jpg");
	console.log(urlImage);
	download(urlImage,nomeArquivo);
}

//função que retorna a distancia (em lat e long entre as imagens)
function getDistance(zoom){
	var distance = 360;
	for(x=1;x<zoom;x++){
		distance = distance/2;
	}
	return distance;
}

download = function(uri, filename){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close',
			function(){
				console.log(filename+" OK!");
				fileState = checkFile(filename);
				if(fileState || !fs.existsSync(filename)){
					download(uri, filename);
				}
			}
		);

  });

}

function checkFile(nomeArquivo){
	var stats = fs.statSync(nomeArquivo);
	var fileSizeInBytes = stats["size"];
	if(fileSizeInBytes<10500){
		console.log('Removing file: '+nomeArquivo+", it's "+fileSizeInBytes+" bytes size");
		fs.unlinkSync(nomeArquivo);
		return true; //true is file removed
	}
	return false; //false is file not removed
}
