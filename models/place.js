var mongoose = require("mongoose");
var gReview = require("./gReview");
var yReview = require("./yReview");

var placeSchema = new mongoose.Schema({

						name: String,
						address: String,
						phone: Number,
						gRating: Number,
						yRating: Number,

						gReviews: [{
							type: mongoose.Schema.Types.ObjectId,
							ref: "gReview"
						}],

						yReviews: [{
							type: mongoose.Schema.Types.ObjectId,
							ref: "yReview"
						}]
					});

placeSchema.pre('remove', function(callback){
	gReview.remove({place_id: this._id}).exec();
	yReview.remove({place_id: this._id}).exec();
	callback();
})

var Place = mongoose.model("Place", placeSchema);

module.exports = Place;
