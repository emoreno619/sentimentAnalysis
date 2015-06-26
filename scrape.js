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
var searchWord = 'pizza'
var searchString = '&find_loc=San+Francisco%2C+CA&ns=1'
var intId;
var intId2;
var locArr = []

var reviews = {}

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

	    intId = setInterval(callMany,5000);
	  }
	});
}

function callback(){
	// if(reviewsArray)
		// console.log(reviewsArray)
	// console.log(counter)
	if (reviewsArray){
		// for (var i = 0; reviewsArray.length; i++){
		// 	// console.log()
		// 	if(reviewsArray[i]){
				// console.log(reviewsArray[i]);
			
				// var myText = reviewsArray[i]

				var myText = reviewsArray[counter2]
				counter2 += 1;
				
				if(counter2 == reviewsArray.length + 1)
					counter2 = 0;

				// console.log(myText)

				alchemyapi.sentiment("text", myText, {}, function(response) {
					// console.log(response)
					console.log("Sentiment: " + response["docSentiment"]["score"]);
				});
			// }
		// }
	}
	
}



function callMany(){
	// for (var i = counter; i < 5; i++){
		console.log(counter)
		requestForALoc()
		
		
		counter += 1
		if (counter == 5)
			clearInterval(intId)
	// }
}

function requestForALoc(){
	var url = 'http://www.yelp.com'
	url += locArr[counter]

	// if(aLoc)
	// 	console.log(aLoc)

	var locReviews = []
	// var counter = 1;
    // var getUrlCallback = function
	request(url, function (error, response, html) {

	  // counter++;
	  // if (counter === aLoc.length){
	  // 	callback();
	  // }
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
	    
	    intId2 = setInterval(callback, 1000);

	    // console.log(reviews["/biz/little-star-pizza-san-francisco"])
	  	
	  	// counter += 1;

	  } else {
	    	console.log(error)
	    }
	});
}

getUrls(searchWord)
