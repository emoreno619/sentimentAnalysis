var db = require("../models");
var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null && req.session.id !== undefined) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureAdmin: function(req, res, next) {
    db.User.findById(req.params.id, function(err,user){
      // console.log(post.ownerId)
      console.log(req.session.id)
      if ("5591c78003211eaa88add917" !== req.session.id) {
        res.redirect('/');
      }
      else {
       return next();
      }
    });
  },

  ensureCorrectUser: function(req, res, next) {
    db.User.findById(req.params.id, function(err,user){
      // console.log(post.ownerId)
      console.log(req.session.id)
      if (user.id !== req.session.id) {
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

  ensureCorrectReviewer: function(req, res, next) {
    db.Review.findById(req.params.id, function(err,review){
      // console.log(post.ownerId)
      console.log(req.session.id)
      if (review.creator !== req.session.id) {
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