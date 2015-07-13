var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');

var counter =1;
var counter2 = 0;


var AlchemyAPI = require('./alchemyapi');
var alchemyapi = new AlchemyAPI();
var reviewsArray;

var baseUrl = 'http://www.yelp.com'
var searchUrl = '/search?find_desc='
var searchWord = 'fish'
var searchString = '&find_loc=San+Francisco%2C+CA&ns=1'
var intId;
var intId2;
var locArr = []
var searchResultsCounter = 0;
var reviewPageCounter = 1;

var arrLocArr = []

var reviews = {}
reviews.arr = []

var nextSearchUrls = ""

// Finds URLs on Yelp of 10 locations that match the searchWord, stores URLs in locArr[]
// Calls 'callMany()', intermittently 

function getUrls(call,cont){
	var diffLocArr = []
	if(!cont){
		searchString = searchWord + searchString
		baseUrl = baseUrl + searchUrl + searchString
	} else {
		baseUrl = 'http://www.yelp.com'
		baseUrl += nextSearchUrls
	}

	searchResultsCounter++;

	request(baseUrl, function (error, response, html) {
	  if (!error && response.statusCode == 200) {
	    var $ = cheerio.load(html);
	    // console.log(html);
	    $('a.biz-name').each(function(i, element){
	    	var a = $(this)
	    	locArr.push(a.attr('href'))

	    	diffLocArr.push([a.attr('href')])
	    	// console.log(a.attr('href'))
	    })
	    // console.log(locArr)

	    $('span.review-count').each(function(i, element){
	    	var a = $(this)
	    	// locArr.push(a.attr('href'))

	    	diffLocArr[i].push(parseInt(a.html()))
	    	// console.log(a.attr('href'))
	    })

	    arrLocArr.push(diffLocArr);

	    if(searchResultsCounter < 1){
	    	nextSearchUrls = $('span.current').parent().next('li').children('a').attr('href')
	    	getUrls(call,true)
	    } else {
	    	console.log(arrLocArr)
	    	// call(callback, true);
	    }
	    // call(callback);
	    
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

function requestForALoc(call2, cont){
	
		if(counter == locArr.length){
			call2()
		} else {


			var url = 'http://www.yelp.com'
			
			url += locArr[counter]

			var locReviews = []
			var locSentiment = []
			
			if(cont){
				// if (reviewPageCounter <= 24 && reviewPageCounter <= Math.floor(reviewCount / 40))
				// actually, this is the limit...but gotta keep it under 1000 ...Math.floor(reviewCount / 40)
				urlAddition = reviewPageCounter * 40;
				url = url + '?start=' + urlAddition
				reviewPageCounter++;
			} else {
				reviewPageCounter = 1;
			}

			request(url, function (error, response, html) {

			  if (!error && response.statusCode == 200) {
			    var $ = cheerio.load(html);
			    // console.log(html);
			    $('div.review-content').each(function(i, element){

			    	var a = $(this).children('p')

			    	
			    	locReviews.push(a.text())
			    	
			    })
			    
			    aCounter = counter-1;

			    reviews.arr.push({ "url" : url, "locReviews" : locReviews, "locSentiment" : locSentiment})
			    reviewsArray = reviews.arr[aCounter]["locReviews"]
			    locRef = locArr[counter] 

			    
			    	// call2()

			  } else {
			    	console.log(error)
			    }
			});
		}
}

// Makes request to Alchemy API for sentiment analysis of each review for a location.
// counter2 tracks the index within reviewsArray. Usually reviewsArray.length == 40 (sometimes 50)

function callback(){

				var myText = reviewsArray[counter2]	
				
				
				alchemyapi.sentiment("text", myText, {}, function(response) {
					
					// console.log(response)
					console.log("Sentiment: " + response["docSentiment"]["score"]);
					reviews.arr[aCounter]['locSentiment'].push(response["docSentiment"]["score"])
					console.log(locRef + ": " + reviews.arr[aCounter]['locSentiment'])

					counter2 += 1;
					if(counter2 < reviewsArray.length && counter != locArr.length){
						
						callback()
					} 
					else if (counter < locArr.length){
						
						counter += 1;
						counter2 = 0;
						requestForALoc(callback)
					} 
					else {
						var toSave = JSON.stringify(reviews);
						fs.appendFile("/tmp/reviewData14", toSave, function(err) {
						    if(err) {
						        return console.log(err);
						    }

						    console.log("The file was saved!");
						}); 
					}

				});
	
	
}


getUrls(requestForALoc)
