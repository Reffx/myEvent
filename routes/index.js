var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Party = require("../models/party");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/", function(req, res){
  res.render("landing.ejs");
});

//show register form
router.get("/register", function(req, res){
  res.render("register.ejs", {page: 'register'});
});

router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
      if(err){
        req.flash("error", err.message + ".");
        res.redirect("register");
        }
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to faescht.ch " + user.username + "!");
        res.redirect("/parties");
      });
    });
});

//show login form
router.get("/login", function(req, res){
  res.render("login.ejs", {page: 'login'});
});

router.post("/login", passport.authenticate("local",
{
    successRedirect: "/parties",
    failureRedirect: "/login",
    failureFlash: "Name oder Passwort falsch.",
    successFlash: "Welcome to faescht.ch!"
  }), function(req, res){
});

//Logout route
router.get("/logout", function(req, res){
  req.flash("success", "Du wurdest ausgeloggt!");
  req.logout();
  res.redirect("/parties");
})



module.exports = router;
