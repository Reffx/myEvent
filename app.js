require('dotenv').config();

var express   = require("express");
var app       = express();
var bodyParser = require("body-parser");
var mongoose  = require("mongoose");
var flash     = require("connect-flash");
var passport   = require("passport");
var methodOverride= require("method-override");
var LocalStrategy = require("passport-local");
Party            = require("./models/party");
User             = require("./models/user");


var partiesRoutes = require("./routes/parties");
var indexRoutes = require("./routes/index");
var mailRoutes = require("./routes/mail");

mongoose.connect("mongodb://localhost:27017/parties", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());

app.locals.moment = require('moment');
// PASSPORT CONFIG
app.use(require("express-session")({
  secret: "Rusty wins cutest dog!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use(partiesRoutes);
app.use(mailRoutes);

app.listen(3000,function(){
    console.log("Der Server ist gestarted");
});
