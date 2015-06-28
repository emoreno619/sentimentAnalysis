$(function(){
	var map;
	var service;
	var infowindow;
	var formData = {name: "food"}
	var sanFrancisco = new google.maps.LatLng(37.7833,-122.4167);
	var location = sanFrancisco
	var ids = []

	$('#nav').css('width', '100%')
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

	  var request = {
	    location: location,
	    radius: '500',
	    query: formData.name
	  };

	  service = new google.maps.places.PlacesService(map);
	  service.textSearch(request, callback);
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
	    console.log(place.name + " " + place.formatted_phone_number)
	    console.log(place)
	    createResultsDiv(place);
	  }
	}

	function createResultsDiv(aResult){
		if (aResult.formatted_phone_number){
			var phoneId = aResult.formatted_phone_number.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~() ]/g,"")
			$('#savedPlacesEnd').append('<div id=' + phoneId + '>' + aResult.name + ' <a id=toggle>see more</a></div>')
			// console.log('GOOGLE COORD: lat: ' + aResult.geometry.location.A + ' long: ' + aResult.geometry.location.F)
			if (aResult.rating)
				$('#'+ phoneId).attr('class', 'aPlace ' + aResult.rating + ' ' + aResult.user_ratings_total)
			else
				$('#'+ phoneId).attr('class', 'aPlace noRating')

			var div = $('#'+ phoneId)

			
			if(!div.hasClass('noRating')){
				var classes = div.attr('class').split(" ")
				
				div.append("<div id=gRating> Google+ Rating: " + classes[1] + " (" + classes[2] + " reviews)</div>")
			} else {
				div.append("<div id=gRating> Google+ Rating: No Rating </div>")
			}

			ajaxYelpShenanigans(div);

			$('#map-canvas').css('width', '80%').css('float', 'right').css('border', '2px solid black').css('border-radius', '2%')
			$('#wrapper').css('width', '18%').css('float', 'left')
			$('#'+ phoneId).css('border', '2px solid black').css('width', '80%').css('margin', '5%').css('float', 'none').css('border-radius', '2%').css('padding-left', '2%')
			$('#formStyle label').css('width', '50%').css('padding-top', '3%').css('padding-left', '3%')
			$('#formStyle input').css('width', '90%').css('margin-left', '5%')
			$('#submitButton').css('padding-top', '3%').css('padding-bottom', '3%')
			$('#formStyle').css('margin-right', '4%').css('border', '2px solid black').css('border-radius', '2%')
			
		}
	}

	function ajaxYelpShenanigans(div){
		var toSend = {}
		
		var str = div.html()
		var index = str.indexOf('<')
		str = str.substring(0, index)
		
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
			  // $('#newpuppyform').remove();
			  // $('#newpuppylink').show();
			  // loadLocations();
			  // console.log( datas.businesses[0].name + " " + datas.businesses[0].rating + " " + datas.businesses[0].phone)
			  if(!div.has('#yRating').length){
			  	// if(!div.hasClass('noRating')){
			  		// console.log("YELP COORD " + "Latitude: " + datas.businesses[0].location.coordinate.latitude + " Longitude: " + datas.businesses[0].location.coordinate.longitude)
			  		div.append("<div id=yRating> Yelp Rating: " + datas.businesses[0].rating + " (" + datas.businesses[0].review_count + " reviews)" +"</div>")
			  		div.append('<div id=address style="display: none;">'+ datas.businesses[0].location.address +'</div>')
			  		div.append('<div id=phoneNum style="display: none;">Phone: '+ datas.businesses[0].phone +'</div>')
			  	// } else {
			  	// 	div.append("<div id=gRating> Yelp Rating: No Rating </div>")
			  	// }
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
	    infowindow.setContent(place.name);
	    infowindow.open(map, this);
	  });
	}

	
	initialize();

})