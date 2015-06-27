var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
morgan = require("morgan"),
db = require('./models'),
dotenv = require('dotenv').load(),
session = require("cookie-session"),
loginMiddleware = require("./middleware/loginHelper"),
routeMiddleware = require("./middleware/routeHelper");

var fs = require('fs');
var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('tiny'));

app.use(session({
  maxAge : 3600000,
  secret: 'illnevertell',
  name: 'chocolate chip'
}));

app.use(loginMiddleware);

//Login Routes

// TODO

//Place Routes

//Root

app.get('/', function(req,res){
	res.redirect('/places')
})

//alchemy test
app.get('/alchemy', function(req,res){
	
	var filename = "sometext.txt";
	// db.Place.create({name: req.body.name, address: req.body.address}

	//successfully reads file and returns score
	fs.readFile(filename, 'utf8', function(err, data) {
	  if (err) throw err;
	  console.log('OK: ' + filename);
	  myText = data;

	  alchemyapi.sentiment("text", myText, {}, function(response) {

	  	console.log("Sentiment: " + response["docSentiment"]["score"]);

	  	res.render('yelp')
	  });
	  
	});
})



function getSentiScore(filename){
	fs.readFile(filename, 'utf8', function(err, data) {
	  if (err) throw err;
	  console.log('OK: ' + filename);
	  myText = data;

	  alchemyapi.sentiment("text", myText, {}, function(response) {

	  	console.log("Sentiment: " + response["docSentiment"]["score"]);
	  	//needs object or array to store score...could be individual logs in db..or simply in memory
	  	
	  });
	  
	});
}

//yelp test
app.get('/yelp', function(req,res){
	var yelp = require("yelp").createClient({
	  consumer_key: process.env.YELP_KEY, 
	  consumer_secret: process.env.YELP_SECRET,
	  token: process.env.YELP_TOKEN,
	  token_secret: process.env.YELP_TSECRET
	});

	// See http://www.yelp.com/developers/documentation/v2/search_api
	yelp.search({term: "trueburger", location: "Oakland"}, function(error, data) {
	  console.log(error);
	  console.log("OAKLAND DATA")
	  console.log(data.businesses[0].location.coordinate);
	  // console.log( "Name: " + data.businesses[0].name + " Rating: " + data.businesses[0].rating + " Phone: " + data.businesses[0].phone)
	});

	// See http://www.yelp.com/developers/documentation/v2/business
	// yelp.business("rotisserie-romados-montreal-2", function(error, data) {
	//   console.log(error);
	//   console.log("SAN FRANCISCO DATA")
	//   console.log(data);
	// });

	res.render('yelp')
})

app.post('/yelp', function(req,res){
	
	console.log("HEY THERE: " + req.body.name)

	var yelp = require("yelp").createClient({
	  consumer_key: "KEFLEf4cm0Xw7vzreOAPLw", 
	  consumer_secret: "-KgYfp8CXRq0tSEd7_XCqYmRQr8",
	  token: "F0VfgC9G0VPeXYF8Q4aX8lbOgVKvkfVC",
	  token_secret: "cZe1601_aBo0HYzYzb0hqmEfKBc"
	});

	
	// See http://www.yelp.com/developers/documentation/v2/search_api
	yelp.search({term: req.body.name, location: "San Francisco"}, function(error, data) {
	  console.log(error);
	  console.log("OAKLAND DATA")
	  // STORE this url.
	  // CALL scrape.js with this url, to get sentiment scores for its reviews, calculate star-rating based on sentiment scores
	  console.log(data.businesses[0].url);
	  // console.log( "Name: " + data.businesses[0].name + " Rating: " + data.businesses[0].rating + " Phone: " + data.businesses[0].phone)
	  res.send(data)
	});

	// See http://www.yelp.com/developers/documentation/v2/business
	// yelp.business("rotisserie-romados-montreal-2", function(error, data) {
	//   console.log(error);
	//   console.log("SAN FRANCISCO DATA")
	//   console.log(data);
	// });

	
})

//Index
app.get('/places', function(req,res){
	db.Place.find({}, function(err, places){
		res.render("places/index", {places:places});
	});
});

//New

app.get('/places/new', function(req, res){
	res.render('places/new');
});

// Google Places API Stuff



// Create

// TODO: need to include creator in object parameter to create

app.post('/places', function(req,res){
	db.Place.create({name: req.body.name, address: req.body.address, phone: req.body.phone, gRating: req.body.gRating, yRating: req.body.yRating}, 
		function(err, place){
			if(err){
				console.log(err);
				res.render('places/new')
			}
			else {



				// url = "http://api.yelp.com/v2/search?term=" + req.body.name + "&location=San+Francisco"; 

				// request.get(url, function(error, response, body){
				// 	if(!error && response.statusCode === 200){
				// 	  var geoData = JSON.parse(body);
					
				// })
				// console.log(place);
				// console.log(req.session._id);
				
				// place.save(function(err){
				// 	if (err) throw err;
				// 	res.redirect('/places');
				// });
		}
	});
});


// Start Server

app.listen(3000, function(){
	"Server is listening on port 3000"
})