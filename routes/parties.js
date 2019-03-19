var express = require("express");
var router = express.Router();
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'reffx',
  api_key: 633641582262479,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

router.get("/parties", function(req, res){
  Party.find({}, function(err, allParties){
    if(err){
      console.log(err);
    } else {
      res.render("parties/index.ejs", {parties:allParties, page: 'parties'});
    }
  });
});

//NEW - show form to create new Party
router.get("/parties/new", middleware.isLoggedIn, function(req,res){
  res.render("parties/new.ejs");
});

//CREATE - add new party to DB
router.post("/parties", middleware.isLoggedIn, upload.single('image'), function (req, res) {
  // geocoder configuration
    geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     req.body.party.lat = data[0].latitude;
     req.body.party.lng = data[0].longitude;
     req.body.party.location = data[0].formattedAddress;
    // cloudinary configuration
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
      if(err){
        req.flash("error", err.message);
        return res.redirect("back");
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.party.image = result.secure_url;
      req.body.party.imageId = result.public_id;
      // add author to campground
      req.body.party.author = {
        id: req.user._id,
        username: req.user.username
      };
      // add to the campground model
      Party.create(req.body.party, function (err, party) {
        if (err) {
          req.flash('failure', err.message);
          return res.redirect('back');
        }
        res.redirect('/parties/' + party.id);
      });
    });
  });
});﻿

// SHOW - shows more info about one party
router.get("/parties/:id", function(req, res){
  //find party with provided ID
  Party.findById(req.params.id, function(err, foundParty){
    if(err || !foundParty){
      req.flash("error", "Party nicht gefunden.");
      res.redirect("back");
    } else {
    res.render("parties/show.ejs", {party: foundParty});
    }
  });
});

// EDIT Party
router.get("/parties/:id/edit", middleware.checkPartyOwnership, function(req, res){
  // if user logged in?
      Party.findById(req.params.id, function(err, foundParty){
          if(err){
            req.flash("error", "Party not found");
          }
            res.render("parties/edit.ejs", {party: foundParty})
          });
});

//UPDATE PARTY
router.put("/parties/:id", middleware.checkPartyOwnership, upload.single("image"),  function(req, res){
    Party.findById(req.params.id, function(err, party){
      //google maps
      geocoder.geocode(req.body.location, async function (err, data) {
       if (err || !data.length) {
         req.flash('error', 'Invalid address');
         return res.redirect('back');
       }
       party.lat = data[0].latitude;
       party.lng = data[0].longitude;
       party.location = data[0].formattedAddress;
       //end of google maps
      if(err){
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if(req.file) {
          try{
            await cloudinary.v2.uploader.destroy(party.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            party.imageId = result.public_id;
            party.image = result.secure_url;
          } catch(err){
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        party.name = req.body.party.name;
        party.description = req.body.party.description;
        party.cost = req.body.party.cost;
        party.age = req.body.party.age;
        party.date = req.body.party.date;
        party.save();
        req.flash("success","Successfully Updated!");
        res.redirect("/parties/" + req.params.id);
        }
      });
  });
});


//DESTROY PARTY ROUTE
router.delete("/parties/:id", middleware.checkPartyOwnership, function(req, res){
  Party.findById(req.params.id, async function(err, party){
    if(err){
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
            await cloudinary.v2.uploader.destroy(party.imageId);
            party.remove();
            req.flash('success', 'Party deleted successfully!');
            res.redirect('/parties');
        } catch(err) {
            if(err) {
              req.flash("error", err.message);
              return res.redirect("back");
            }
        }
      });
    });

module.exports = router;
