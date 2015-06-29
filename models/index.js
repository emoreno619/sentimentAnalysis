var dotenv = require('dotenv').load(),
mongoose = require("mongoose");
mongoose.connect("mongodb://" + process.env.DB_HOST);
// mongoose.connect("mongodb://localhost/sentimentAnalysis")
module.exports.Place = require("./place");
module.exports.User = require("./user");
module.exports.gReview = require("./gReview");
module.exports.yReview = require("./yReview");
module.exports.Review = require("./review");
