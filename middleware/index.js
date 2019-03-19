var Party = require("../models/party");

// all the middlware goes here
var middlewareObj = {};

middlewareOby = {}

middlewareObj.checkPartyOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Party.findById(req.params.id, function(err, foundParty){
          if(err || !foundParty){
            req.flash("error", "Party nicht gefunden.");
            res.redirect("back");
          } else {
            if(foundParty.author.id.equals(req.user._id) || req.user.isAdmin){
            next();
            } else {
            req.flash("error", "Du hast keine Zugriffsberechtigung.");
            res.redirect("back")
            }
        }
      });
    } else {
      req.flash("error", "Du musst dich zuerst einloggen.");
      res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Du musst dich zuerst einloggen!");
  res.redirect("/login");
}


module.exports = middlewareObj;
