var mongoose = require("mongoose");

var gReviewSchema = new mongoose.Schema({
						body: String,
						creator: String,
						ratingScore: Number,

						user: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "User"
						},

						place: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "Place"
						}
					});

var gReview = mongoose.model("gReview", gReviewSchema);

module.exports = gReview;