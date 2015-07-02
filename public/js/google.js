//TODO 1) Make names in search results into links to show page or marker?... on show page, include yelp and g+ reviews, more details like hours
// 	   2) Maps stuff....allow location to be set in form, fix markers, get browser location
// 	   3) Fix header so that favorite (i.e., saved) locations are shown horizontally...allow horizontal scroll
// 	   4) Show logged in username on each page and log in/out as appropriate
// 	   5) Include 'Is Open' info in search results 
// 	   6) Continue with data sentiment stuff...include reviews for multiple pages in scrape? Include G+ reviews for sentiment?
//		  Dynamic scrape to be compared with decile rule of sentiment? Analysis of relation among G+ scores and Y scores?
//     7) Actually match the two api calls via phone number?
// 	   8) Offer sort options of search results?
// 	   9) Create link to favorite place for a user

$(function(){
	var map;
	var service;
	var infowindow;
	var formData = {name: "food"}
	var sanFrancisco = new google.maps.LatLng(37.7833,-122.4167);
	var location = sanFrancisco
	var ids = []
	var divArr = []

	$('#savedPlaces p').css('max-height', '10%').css('padding', '2px')
	
	$('#nav p').css('float', 'none')

	$('#searchPlaceForm').submit(function(e){
		e.preventDefault();
		ids = []
		$('.aPlace').remove()
		formData.name = $('#name').val();
		//need to create google.maps.LatLng object from city search to be stored
		//request.location below and map.center
		formData.city = $('#city').val();
		

		initialize();
	})


	function initialize() {
	  

	  map = new google.maps.Map(document.getElementById('map-canvas'), {
	      center: location,
	      zoom: 15
	    });

	  // Try HTML5 geolocation
	  if(formData.city){
	        	console.log("GOT THERE")
	        	address = formData.city
	        	geocoder = new google.maps.Geocoder();
	        	geocoder.geocode( { 'address': address}, function(results, status) {
	        	      if (status == google.maps.GeocoderStatus.OK) {
	        	        
	        	        location = results[0].geometry.location
	        	        console.log(location)
	        	        map.setCenter(results[0].geometry.location);

	        	        var request = {
	        	          location: location,
	        	          radius: '500',
	        	          query: formData.name
	        	        };

	        	        service = new google.maps.places.PlacesService(map);
	        	        service.textSearch(request, callback);
	        	        // var marker = new google.maps.Marker({
	        	        //     map: map,
	        	        //     position: results[0].geometry.location
	        	        // });
	        	      } else {
	        	        alert("Geocode was not successful for the following reason: " + status);
	        	      }
	        	    });
	        } else if(navigator.geolocation) {
	      navigator.geolocation.getCurrentPosition(function(position) {
	        var pos = new google.maps.LatLng(position.coords.latitude,
	                                         position.coords.longitude);

	        var infowindow = new google.maps.InfoWindow({
	          map: map,
	          position: pos,
	          content: 'Your location.'
	        });

	        map.setCenter(pos);
	        location = pos;

	        var request = {
	          location: location,
	          radius: '500',
	          query: formData.name
	        };

	        service = new google.maps.places.PlacesService(map);
	        service.textSearch(request, callback);
	  
	      });
	    } else {

	      var request = {
	        location: location,
	        radius: '500',
	        query: formData.name
	      };

	      service = new google.maps.places.PlacesService(map);
	      service.textSearch(request, callback);
	    }
	}

	function callback(results, status) {
		
	  if (status == google.maps.places.PlacesServiceStatus.OK) {
	    for (var i = 0; i < results.length; i++) {
	      var place = results[i];
	      // console.log(place.name + " " + place.rating)
	      
	      // console.log(place.types)
	      // console.log(place.formatted_address)
	      // console.log(place.place_id)
	      if(place.place_id)
	      	ids.push({placeId: place.place_id})
	    
	      createMarker(results[i]);
	    }
	  }
	  detailsRequest();
	  // console.log(ids)
	}

	function detailsRequest(){
		
		for (var i = 0; i < ids.length; i++){
			
			service.getDetails(ids[i], callback2);
		}
	
	}

	function callback2(place, status) {
	  if (status == google.maps.places.PlacesServiceStatus.OK) {
	    // console.log(place.name + " " + place.formatted_phone_number)
	    // console.log(place)
	    createResultsDiv(place);
	  }
	}

	function createResultsDiv(aResult){
		if (aResult.formatted_phone_number){
			var phoneId = aResult.formatted_phone_number.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~() ]/g,"")
			var name4Class = encodeURI(aResult.name)
			var one = $('#savedPlacesEnd').append('<div id=' + phoneId + ' ' + 'class=' + name4Class + '><h3>' + aResult.name + '</h3> <a id=toggle>see more</a></div>')
			var div = $('#'+ phoneId)
			// console.log(div)
			var gPrice; 

			if(aResult.price_level){
				gPrice = aResult.price_level
				div.append("<div id=gPrice> Price: " + gPrice + " / 5</div>")
			} else {
				div.append("<div id=gPrice> Price: No Price Info</div>")
			}
			// console.log('GOOGLE COORD: lat: ' + aResult.geometry.location.A + ' long: ' + aResult.geometry.location.F)
			if (aResult.rating)
				$('#'+ phoneId).attr('class', 'aPlace ' + aResult.rating + ' ' + aResult.user_ratings_total)
			else
				$('#'+ phoneId).attr('class', 'aPlace noRating')

	

			if(!div.hasClass('noRating')){
				var classes = div.attr('class').split(" ")
				div.append("<div id=gRating> Google+ Rating: " + classes[1] + " (" + classes[2] + " reviews)</div>")

			} else {
				div.append("<div id=gRating> Google+ Rating: No Rating </div>")
			}

			ajaxYelpShenanigans(div, aResult,phoneId);
			styleThoseResults(phoneId);
			
		}
	}

	function styleThoseResults(phoneId){

		$('#map-canvas').css('width', '70%').css('float', 'right').css('border-radius', '2%')
		$('#wrapper').css('width', '28%').css('float', 'left')
		$('#savedPlacesEnd').css('height', '62%').css('overflow-y','auto').css('margin-top', '2%').css('margin-left', '5px')
		$('#'+ phoneId).css('width', '80%').css('margin', '5%').css('float', 'none').css('border-radius', '5px').css('padding-left', '7%').css('padding-right', '7%').css('padding-bottom', '7%')
		
		$('#formStyle label').css('width', '50%').css('padding-top', '3%').css('padding-left', '3%')
		$('#formStyle input').css('width', '90%').css('margin-left', '5%')
		$('#submitButton').css('padding-top', '3%').css('padding-bottom', '3%')
		$('#formStyle').css('margin-right', '4%').css('border', '2px solid black').css('border-radius', '2%')
	}

	function ajaxYelpShenanigans(div, aResult,phoneId){
		//PASS LOCATION AS PART OF 'toSend'

		var toSend = {}
		
		var str = div.html()
		var index = str.indexOf('</')
		str = str.substring(4, index)
		// console.log('HI IM HTML' + str)
		toSend.phone = div.attr('id')
		toSend.name = str;
		// console.log(toSend)
		// yelpCall(toSend);
		if(!div.has('#yRating').length){
			$.ajax({
			  type: 'POST',
			  url: '/yelp',
			  data: toSend,
			  dataType: 'json'
			}).done(function(datas) {
			 // console.log(datas)
			  if(!div.has('#yRating').length){
			  		// console.log(datas.businesses.length)
			  		// datas.forEach(function(aPlace){
			  		// 	// console.log(aPlace.name)
			  		// 	// console.log(aResult.name)
			  		// 	// console.log(aPlace.phone)
			  		// 	// console.log(phoneId)
			  		// 	if(aPlace.phone){
			  		// 		var phon = aPlace.phone.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~() ]/g,"")
				  	// 		if(phoneId == phon){
				  	// 			div.append("<div id=yRating> Yelp Rating: " + aPlace.rating + " (" + aPlace.review_count + " reviews)" +"</div>")
				  	// 			div.append('<div id=address style="display: none;">'+ aResult.formatted_address +'</div>')
				  	// 			div.append('<div id=phoneNum style="display: none;">Phone: '+ aResult.formatted_phone_number +'</div>')
				  	// 		}
				  	// 	}
			  		// })
					// console.log(datas)
					if(datas[0])
						div.append("<div id=yRating> Yelp Rating: " + datas[0].rating + " (" + datas[0].review_count + " reviews)" +"</div>")
			  		div.append('<div id=address style="display: none;">'+ aResult.formatted_address +'</div>')
			  		div.append('<div id=phoneNum style="display: none;">Phone: '+ aResult.formatted_phone_number +'</div>')
			  		
			  }
			});
		}
	}

	$("body").on("click", ".aPlace", function(event){
		div = $(this)
		if(div.children('#toggle').html() == 'see more'){
			div.children('#yRating').show()
			div.children('#toggle').html('see less')
			div.children('#address').show()
			div.children('#phoneNum').show()

		} else {
			div.children('#address').hide()
			div.children('#phoneNum').hide()
			div.children('#toggle').html('see more')
			// 	div.html(div.html() + ' <a id=toggle>see more</a>')
		}
	})

	// look into 'debouncing?' (part of underscore) to handle delay 

	function createMarker(place) {
	  var placeLoc = place.geometry.location;
	  var marker = new google.maps.Marker({
	    map: map,
	    position: place.geometry.location
	  });

	  google.maps.event.addListener(marker, 'click', function() {
	    var options = {
	    	map: map,
	    	position: place.geometry.location,
	    	content: place.name
	    }

	    var infowindow = new google.maps.InfoWindow(options);

	    infowindow.setContent(place.name);
	    infowindow.open(map, this);
	  });
	}

	
	initialize();

})