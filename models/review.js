var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
						
						title: {
							type: String,
							required: true
						},
						body: {
							type: String,
							required: true
						},
						creator: String,
						rating: {
							type: number,
							required: true
						},

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