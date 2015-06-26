var request = require('request');
var cheerio = require('cheerio');


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

var counter = 1;
var counter2 = 0;


var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();
var reviewsArray;

var searchUrl = 'http://www.yelp.com/search?find_desc='
var searchWord = 'tacos'
var searchString = '&find_loc=San+Francisco%2C+CA&ns=1'
var intId;
var intId2;
var locArr = []


var reviews = {}

// Finds URLs on Yelp of 10 locations that match the searchWord, stores URLs in locArr[]
// Calls 'callMany()', intermittently 

function getUrls(searchWord, callback){

	searchString = searchWord + searchString
	searchUrl += searchString

	request(searchUrl, function (error, response, html) {
	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    // console.log(html);
	    $('a.biz-name').each(function(i, element){
	    	var a = $(this)
	    	locArr.push(a.attr('href'))
	    	// console.log(a.attr('href'))
	    })
	    // console.log(locArr)
	
	//NEED THIS
	    // for (var i = 1; i < locArr.length; i++){
	    	
	    // 	requestForALoc(locArr[i]);
	    // }

	    intId = setInterval(callMany,3000);
	  } else {
	  	console.log(error);
	  }
	});
}

// Counts and calls requestForALoc() which requests each individual location page
// for each location stored in locArr[]. Also, stops intermitten calling of this function
// once each location has been requested (i.e., counter == locArr.length + 1) 
// Note: counter starts at 1, because locArr.length == 11 but first index is not a location

function callMany(){

		// console.log(counter)
		requestForALoc()	
		
		counter += 1
		if (counter == locArr.length || counter == 12)
			clearInterval(intId)
	
}

// Makes request to a particular location page and stores its reviews in locReviews[].
// The reviews (inside of locReviews[]) are then stored in an object ('reviews') along
// with the URL of the yelp location page from which they were found. The keys for the
// reviews object are the partial urls of each location, which are each an object that 
// stores their respective full url and array of reviews (locReviews). Also, this function
// intermittently calls callback().

function requestForALoc(){

	var url = 'http://www.yelp.com'
	url += locArr[counter]

	var locReviews = []

	request(url, function (error, response, html) {

	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    // console.log(html);
	    $('div.review-content').each(function(i, element){

	    	var a = $(this).children('p')

	    	// locArr.push(a.attr('href'))
	    	locReviews.push(a.text())
	    	// console.log(a.text())
	    })
	    
	    reviews[locArr[counter]] = { "url" : url, "locReviews" : locReviews}
	    reviewsArray = reviews[locArr[counter]]['locReviews'] 
	    
	    console.log(reviewsArray.length)

	    intId2 = setInterval(callback, 1000);

	    // console.log(reviews["/biz/little-star-pizza-san-francisco"])

	  } else {
	    	console.log(error)
	    }
	});
}

// Makes request to Alchemy API for sentiment analysis of each review for a location.
// counter2 tracks the index within reviewsArray. Usually reviewsArray.length == 40 (sometimes 50)

function callback(){

				// stop interval HERE????

				if(counter2 == reviewsArray.length + 1){
					counter2 = 0;
					clearInterval(intId2)
				}

				var myText = reviewsArray[counter2]
				counter2 += 1;
				
				alchemyapi.sentiment("text", myText, {}, function(response) {
				
					console.log("Sentiment: " + response["docSentiment"]["score"]);

				});
	
	
}

getUrls(searchWord)
