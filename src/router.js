//depends on folders controllers and middleware
var controllers = require('./controllers');
var mid = require('./middleware');
var passport = require('passport');
var router = function(app){

    app.get("/login", mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
    app.get("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
    app.get("/creater", controllers.Character.creationPage);
    app.post("/creater", mid.requiresLogin, controllers.Character.create);
    app.get("/", mid.requiresSecure, controllers.Account.loginPage);
    
    
};

module.exports = router;