// var db = require("../models");
var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {
    db.User.findById(req.params.id, function(err,user){
      // console.log(post.ownerId)
      console.log(req.session.id)
      if (user._id !== req.session.id) {
        res.redirect('/');
      }
      else {
       return next();
      }
    });
  },

  ensureCorrectPoster: function(req, res, next) {
    db.Place.findById(req.params.place_id, function(err,place){
      // console.log(post.ownerId)
      console.log(req.session.id)
      if (place.creator !== req.session.id) {
        res.redirect('/');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      res.redirect('/');
    }
    else {
     return next();
    }
  }
};
module.exports = routeHelpers;