var request = require('request');
var cheerio = require('cheerio');

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

function getUrls(call){
	console.log("2")
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
	    console.log(locArr)

	    call(callback);
	    
	  } else {
	  	console.log(error);
	  }
	});
}

// Counts and calls requestForALoc() which requests each individual location page
// for each location stored in locArr[]. Also, stops intermitten calling of this function
// once each location has been requested (i.e., counter == locArr.length + 1) 
// Note: counter starts at 1, because locArr.length == 11 but first index is not a location


// Makes request to a particular location page and stores its reviews in locReviews[].
// The reviews (inside of locReviews[]) are then stored in an object ('reviews') along
// with the URL of the yelp location page from which they were found. The keys for the
// reviews object are the partial urls of each location, which are each an object that 
// stores their respective full url and array of reviews (locReviews). Also, this function
// intermittently calls callback().

function requestForALoc(call2){
	console.log("4")
	var url = 'http://www.yelp.com'
	url += locArr[counter]

	var locReviews = []
	var locSentiment = []
	

	request(url, function (error, response, html) {

	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    // console.log(html);
	    $('div.review-content').each(function(i, element){

	    	var a = $(this).children('p')

	    	
	    	locReviews.push(a.text())
	    	
	    })
	    

	    reviews[locArr[counter]] = { "url" : url, "locReviews" : locReviews, "locSentiment" : locSentiment}
	    reviewsArray = reviews[locArr[counter]]['locReviews']
	    locRef = locArr[counter] 

	    console.log(locReviews)
	    call2()

	  } else {
	    	console.log(error)
	    }
	});
}

// Makes request to Alchemy API for sentiment analysis of each review for a location.
// counter2 tracks the index within reviewsArray. Usually reviewsArray.length == 40 (sometimes 50)

function callback(){

				var myText = reviewsArray[counter2]	
				
				
				alchemyapi.sentiment("text", myText, {}, function(response) {
				
					// console.log(response)
					console.log("Sentiment: " + response["docSentiment"]["score"]);
					reviews[locRef]['locSentiment'].push(response["docSentiment"]["score"])
					console.log(locRef + ": " + reviews[locRef]['locSentiment'])

					counter2 += 1;
					if(counter2 <= reviewsArray.length){
						callback()
					} 
					// else if (counter < locArr.length -1){
					// 	counter += 1;
					// 	counter2 = 0;
					// 	requestForALoc(callback)
					// } 
					else {
						var toSave = JSON.stringify(reviews);
						fs.appendFile("/tmp/reviewData", toSave, function(err) {
						    if(err) {
						        return console.log(err);
						    }

						    console.log("The file was saved!");
						}); 
					}

				});
	
	
}


getUrls(requestForALoc)
