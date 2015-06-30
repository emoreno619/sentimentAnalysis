var fs = require('fs');

var str = ""
var i = 1;
var filename = '/tmp/reviewData'

var result = {};
result.loc = []

function reader(call, filename){
	fs.readFile(filename, 'utf8', function (err,data) {
	  
	  var total = 0;
	  var grandTotal = 0;

	  if (err) {
	    return console.log(err);
	  }
	  data = JSON.parse(data);

	  result.max  = {}
	  result.max.url = ""
	  result.max.score = 0
	  result.min  = {}
	  result.min.url = ""
	  result.min.score = 0
	  result.mean  = 0

	  data.arr.forEach(function(aLoc){
	  	var locResult = {}
	  	result.loc.push(locResult)
	  	// console.log(aLoc)
	  	locResult.url = aLoc.url;
	  	locResult.scores = []
	  	locResult.total = 0
	  	total = 0;
		var locScores = []
	  	// locResult[aLoc]
	  	aLoc.locSentiment.forEach(function(score){
	  		if(score){
	  			locScores.push(score)
	  			total += parseFloat(score)
			}
	  			// console.log(locScores)
	  	})

	  	if(result.min.score == 0){
	  		result.min.url = aLoc.url
	  		result.min.score = total
	  	}

	  	locResult.scores = locScores
	  	locResult.total = total;

	  	if(total > result.max.score){
	  		result.max.score = total
	  		result.max.url = aLoc.url
	  	}
	  	if(total < result.min.score){
	  		result.min.score = total
	  		result.min.url = aLoc.url
		}		
	  	grandTotal += total 
	  })

	  result.mean = grandTotal/data.arr.length
	  
  	i++;
  	if(i<9)
  		init()
  	else{
  		// pResult()
  		call()
	}

	  // result.loc.forEach(function(a){
	  // 	console.log(a)
	  // })

	});
}

function writer(){
	
	// console.log(categoryScores)
	// result.forEach(function(score){
	// 	// console.log(score)
	// 	if(score != null){
	// 		str += score + ","
	// 	}
	// })

	str = JSON.stringify(result)
	// console.log(str)

	fs.appendFile("/tmp/reviewData_1through8_scores", str, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}

function pResult(){
	result.loc.forEach(function(aResult){
		console.log(aResult)
	})
	console.log("Max: " + result.max.score + " Place: " + result.max.url)
	console.log("Min: " + result.min.score + " Place: " + result.min.url)
	console.log("Mean: " + result.mean)
}

function init(call){
 	filename = '/tmp/reviewData'
 	filename += i
 	console.log(filename)
 	reader(writer, filename)
 	// call();	
}

init();
// reader(writer,'/tmp/reviewData3')
// writer()