var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
						
						title: String,
						body: String,
						creator: String,
						rating: Number,

						user: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "User"
						},

						place: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "Place"
						}
					});

var Review = mongoose.model("Review", reviewSchema);

module.exports = Review;