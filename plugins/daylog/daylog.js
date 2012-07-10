module.exports = function setup(options, imports, register) {
    var express = require("express");
    var OAuth = require('oauth').OAuth;

    // Setup the Express.js server
    var app = express.createServer();
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.static(process.cwd() + '/www'));
    app.use(express.session({
        secret: "skjghskdjfhbqigohqdiouk"
    }));

    app.get('/', function(req, res, next) {
        if (req.session.oauth_access_token)
            res.redirect("/app");
        next();
    });

    // Request an OAuth Request Token, and redirects the user to authorize it
    app.get('/github_login', function(req, res, next) {
        next();
    });

    // Request an OAuth Request Token, and redirects the user to authorize it
    app.get('/app', function(req, res, next) {
        if (!req.session.oauth_access_token) {
            res.redirect("/github_login");
            return;
        }

        res.render('google_contacts.ejs', {
            locals: { feed: feed }
        });
    });

    register(null, {});

    app.listen(8081, "0.0.0.0");
};