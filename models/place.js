var mongoose = require("mongoose");
var gReview = require("./gReview");
var yReview = require("./yReview");
var Review = require("./review")

var placeSchema = new mongoose.Schema({

						creator: String,
						name: {
							type: String,
							required: true
						},
						address: String,
						city: String,
						state: String,
						phone: Number,
						gRating: Number,
						yRating: Number,
						ourRating: Number,

						gReviews: [{
							type: mongoose.Schema.Types.ObjectId,
							ref: "gReview"
						}],

						yReviews: [{
							type: mongoose.Schema.Types.ObjectId,
							ref: "yReview"
						}],

						reviews: [{
							type: mongoose.Schema.Types.ObjectId,
							ref: "Review"
						}]
					});

placeSchema.pre('remove', function(callback){
	gReview.remove({place_id: this._id}).exec();
	yReview.remove({place_id: this._id}).exec();
	Review.remove({place_id: this._id}).exec();
	callback();
})

var Place = mongoose.model("Place", placeSchema);

module.exports = Place;
