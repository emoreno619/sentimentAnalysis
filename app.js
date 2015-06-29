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

app.get('/signup', routeMiddleware.preventLoginSignup, function(req, res){
  res.render('users/signup');
})

app.post("/signup", routeMiddleware.preventLoginSignup, function(req,res){
  var newUser = req.body.user;
  db.User.create(newUser, function(err, user){
      if(user){
        req.login(user);
        res.redirect("/users/" + user._id)
      } else {
        console.log(err);
        res.render("users/signup")
      }
    }
  )
})

app.get("/login", routeMiddleware.preventLoginSignup, function(req,res){
  res.render("users/login");
})

app.post("/login", function(req,res){
  db.User.authenticate(req.body.user, function (err, user){
    if(!err && user !== null){
      req.login(user)
      res.redirect("/users/" + user._id)
    } else {
      res.render("users/login")
    }
  })
})

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
})

//Place Routes

//Root

app.get('/', function(req,res){
	res.redirect('/places')
})


//Index
app.get('/places', function(req,res){
	db.Place.find({}, function(err, places){
		res.render("places/index", {places:places});
	});
});

//New

app.get('/places/new', routeMiddleware.ensureLoggedIn, function(req, res){
	res.render('places/new');
});

// Create

// TODO: need to include creator in object parameter to create

app.post('/places', function(req,res){
	db.Place.create({name: req.body.name, address: req.body.address, city: req.body.city, state: req.body.state, phone: req.body.phone}, 
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
				place.creator = req.session.id;
				place.save(function(err){
					if (err) throw err;
					res.redirect('/places');
				});
		}
	});
});

//Show

app.put('/places/fav/:id', function(req,res){
	db.Place.findById(req.params.id, function(err,place){
		db.User.findByIdAndUpdate(req.session.id, {}, function(err,user){
			if(err){
				console.log(err);
				res.render("places/show")
			} else {
				user.favPlaces.push(place)
				user.save(function(err){
					res.redirect("/places/" + req.params.id)
				})
			}
		})
	})
})

app.get('/places/:id', function(req,res){
	db.Place.findById(req.params.id, function(err, place){
		db.Review.find(
		{
			_id: {$in: place.reviews}
		},
		function(err,reviews){
			res.render('places/show', {place:place, reviews:reviews})
		});
	});
});

// Edit
// TODO: auth!	
app.get('/places/:place_id/edit', routeMiddleware.ensureCorrectPoster, function(req,res){
	db.Place.findById(req.params.place_id, function(err, place){
		res.render('places/edit', {place:place});
	});
});

// Update
// TODO: need to include creator in object parameter to findbyidandupdate
// maybe not? since the user id will not have changed
app.put('/places/:id', function(req,res){
	db.Place.findByIdAndUpdate(req.params.id, {name: req.body.name, address: req.body.address, phone: req.body.phone, city: req.body.city, state: req.body.state}, function(err, place){
		if(err){
			res.render("places/edit")
		} else {
			res.redirect('/places')
		}
	})
})

// Destroy
// TODO: auth! or at least for whichever view will display this form
app.delete('/places/:id', function(req,res){
	db.Place.findById(req.params.id, function(err,place){
		if(err){
			console.log(err);
			res.render("places/show")
		} else {
			place.remove();
			res.redirect("/places")
		}
	})
})

// Reviews routes

// Index
app.get('/places/:place_id/reviews', function(req,res){
	db.Place.findById(req.params.place_id).populate('reviews').exec(function(err,place){
			res.render("reviews/index", {place:place});
	});
});

// New

//TODO: auth!!
app.get('/places/:place_id/reviews/new', routeMiddleware.ensureLoggedIn, function(req,res){
	db.Place.findById(req.params.place_id, function(err,place){
		res.render('reviews/new', {place:place});
	});
});

// Create

//TODO: auth!!
app.post('/places/:place_id/reviews', routeMiddleware.ensureLoggedIn, function(req,res){
	db.Review.create({creator: req.session.id, title:req.body.title, body:req.body.body, rating:req.body.rating}, function (err, review){
		if(err){
			console.log(err)
			res.render("reviews/new");
		} else {
			console.log(review)
			db.Place.findById(req.params.place_id,function(err,place){
				place.reviews.push(review);
				review.place = place.id;

				db.User.findById(req.session.id, function(err,user){
					
					user.Reviews.push(review)

					review.save(function(err){
						place.save(function(err){
							user.save(function(err){
								res.redirect("/places/"+ req.params.place_id)
							});
						});
					});

				})
			});
		}
	});
});

// SHOW
app.get('/places/:place_id/reviews/:id', function(req,res){
  db.Review.findById(req.params.id)
    .populate('place')
    .exec(function(err,review){
      console.log(review.place)
      res.render("reviews/show", {review:review});
    });
});

// Edit
//TODO: auth!!
app.get("/places/:place_id/reviews/:id/edit", routeMiddleware.ensureCorrectReviewer, function(req,res){
	db.Review.findById(req.params.id)
	.populate('place')
	.exec(function(err,review){
		res.render("reviews/edit", {review:review});
	});
});

// Update

//TODO: Not redirecting correctly!!!
app.put('/places/:place_id/reviews/:id', function(req,res){
	db.Review.findByIdAndUpdate(req.params.id, {title:req.body.title, body:req.body.body, rating:req.body.rating}, function(err,review){
		if(err){
			res.render("reviews/edit");
		} else {
			res.redirect('/places/' + req.params.place_id + '/reviews');
		}
	});
});

// Destroy

app.delete('/places/:place_id/reviews/:id', function(req,res){
	db.Review.findByIdAndRemove(req.params.id, function (err, review){
		if(err){
			console.log(err);
			res.render('reviews/edit')
		} else {
			res.redirect("/places/" + req.params.place_id + "/reviews");
		}
	})
})

// User Routes

// Index

// TODO: auth only for admin!
app.get('/users', function(req,res){
	db.User.find({}, function(err, users){
		db.Review.find({}, function(err, reviews){
			db.Place.find({}, function(err, places){
				res.render("users/index", {users:users, reviews:reviews, places:places});
			})
		})
	});
});

// Show
// TODO: auth!
app.get('/users/:id', function(req,res){
	db.User.findById(req.params.id, function(err, user){
		db.Place.find({}, function(err,places){
			db.Review.find(
			{
				_id: {$in: user.Reviews}
			},
			function(err,reviews){
				res.render('users/show', {user:user, reviews:reviews, places:places}) //include comments on user show page?
			});
		})
	});
});

// Edit
// TODO: auth! users can only edit themselves (except for admin?)	
app.get('/users/:id/edit', function(req,res){
	db.User.findById(req.params.id, function(err, user){
		res.render('users/edit', {user:user});
	});
});

// Update
// TODO: need to include creator in object parameter to findbyidandupdate
// maybe not? since the user id will not have changed
app.put('/users/:id', function(req,res){
	db.User.findByIdAndUpdate(req.params.id, {email: req.body.email, favPlaces: req.body.favPlaces}, function(err, user){
		if(err){
			res.render("users/edit")
		} else {
			res.redirect('/users/' + user._id)
		}
	})
})

// Destroy
// TODO: auth! or at least for whichever view will display this form
app.delete('users/:id', function(req,res){
	db.User.findById(req.params.id, function(err,user){
		if(err){
			console.log(err);
			res.render("users/show")
		} else {
			post.remove();
			res.redirect("/login")
		}
	})
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

// Catch All

app.get('*', function(req,res){
	res.render('404');
})

// Start Server

app.listen(3000, function(){
	"Server is listening on port 3000"
})