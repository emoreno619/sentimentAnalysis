var fs = require('fs');

var str = ""
var categoryScores = []

function reader(call){
	fs.readFile('/tmp/reviewData4', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  data = JSON.parse(data);
	  data.arr.forEach(function(aLoc){
	  	// console.log(aLoc.locSentiment)
	  	aLoc.locSentiment.forEach(function(score){
	  		if(score)
	  			categoryScores.push(score)

	  	})
	  })
	  // console.log(categoryScores)
	  call()
	  // console.log(data.arr[0]['/biz/el-mercado-urbano-at-la-urbana-san-francisco?osq=tacos'].locSentiment)
	});
}

function writer(){
	
	console.log(categoryScores)
	categoryScores.forEach(function(score){
		// console.log(score)
		if(score != null){
			str += score + ","
		}
	})

	fs.appendFile("/tmp/sandwichScores", str, function(err) {
	    if(err) {
	        return console.log(err);
	    }

	    console.log("The file was saved!");
	}); 
}


reader(writer)
// writer()