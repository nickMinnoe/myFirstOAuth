var models = require('../models');

var Account = models.Account;

var loginPage = function(req, res){
    res.render('login');
};

var signupPage = function(req, res){
    res.render('signup');
};

var logout = function(req, res){
    req.session.destroy();
    res.redirect('/');
};





module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;
module.exports.logout = logout;