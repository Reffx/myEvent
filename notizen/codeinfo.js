
//-------------------------------------------------
//ADMIN MACHEN --- ich einen neuen Admin machen will ändere ich bei routes/index.js das registrieren so ab, dass ein bestimmer user ein admin ist.
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});

    if(req.body.username === 'admin') {newUser.isAdmin = true //Diese Zeile einfügen. 'admin' durch gewollten usernamen ersetzten

    User.register(newUser, req.body.password, function(err, user){
      if(err){
        console.log(err);
        return res.render("register", {error: err.message});
        }
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to faescht.ch " + user.username);
        res.redirect("/parties");
      });
    });
});
//------------------------------------------------------
