var mongoose = require("mongoose");

var sentiReviewSchema = new mongoose.Schema({
						body: String,
						creator: String,
						ratingScore: Number,
						sentiment: Number,

						user: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "User"
						},

						place: {
							type: mongoose.Schema.Types.ObjectId,
							ref: "Place"
						}
					});

var sentiReview = mongoose.model("sentiReview", sentiReviewSchema);

module.exports = sentiReview;