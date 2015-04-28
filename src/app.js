//depends on files/folders: client, favicon, views

var path = require('path');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var url = require('url');
var Account = require('./models').Account;
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var logger = require('morgan');
var methodOverride = require('method-override');
var controllers = require('./controllers');
var mid = require('./middleware');
var FACEBOOK_APP_ID = "1583626498564449";
var FACEBOOK_APP_SECRET = "ed3a6367859396a0d5e4c6a134be0ca1";

//used for session keeping by passport
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "https://whispering-shore-9873.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      return done(null, profile);
    });
  }
));

var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/CharacterMaker2";

var db = mongoose.connect(dbURL, function(err){
    if(err){
        console.log("Could not connect to database.");
        throw err;
    }
});


var router = require('./router.js');

var server;
var port = process.env.PORT || process.env.NODE_PORT || 3000;

var app = express();
app.use('/assets', express.static(path.resolve(__dirname+'../../client/')));
app.use(compression());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(logger());
app.use(methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ secret: 'keyboard cat' }));


app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(favicon(__dirname + '/../client/image/favicon.png'));
app.use(cookieParser());

//As much as I thought they did, these do not belong in router.js
//they cause a 404 in there

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });
  
  //Callback after signing in with Facebook
  //If something goes wrong go to login page, otherwise continue
  app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    console.log(req);
    //Looks up the user that we just received to see if they exist yet
    Account.AccountModel.findByID(req.user.id, function(err, user){
        //Error occured, handle it
        if(err){
            console.err(err);
            console.log("Auth error-- my end.");
        } 
        //user exists, don't duplicate
        else if(user){
            req.session.account = user.toAPI();
            res.redirect('/creater');
        } 
        //We need a new user, lets make them feel at home
        else{
        var accountData = {
            facebookID: req.user.id,
            Fname: req.user.name.givenName
            };
        
        var newAccount = new Account.AccountModel(accountData);
            newAccount.save(function(err){
                if(err){
                    console.log(err);
                    return res.status(400).json({error: "An error occured"});
                }
                req.session.account = newAccount.toAPI();
                res.redirect('/creater');
            });
        }
    });
});  
  app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router(app);
server = app.listen(port, function(err){
    if(err){
        throw err;
    }
    console.log('Listening on port '+port);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}