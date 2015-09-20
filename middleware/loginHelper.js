var db = require("../models");

var loginHelpers = function (req, res, next) {

  req.login = function (user) {
    req.session.id = user._id;
  };

  req.logout = function () {
    req.session.id = null;
    req.user  = null;
  };

  next();
};

module.exports = loginHelpers;