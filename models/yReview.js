var mongoose = require("mongoose");

var yReviewSchema = new mongoose.Schema({
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

var yReview = mongoose.model("yReview", yReviewSchema);

module.exports = yReview;