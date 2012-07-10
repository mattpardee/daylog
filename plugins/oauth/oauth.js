module.exports = function setup(options, imports, register) {
    var OAuth = require('oauth').OAuth2;
    var url = require("url");

    var oa = new OAuth(options.appId,
        options.appSecret,
        "https://github.com/",
        "login/oauth/authorize",
        "login/oauth/access_token");

    register(null, {
        oauth: {
            authenticate: function(request, response, username, password, callback) {
                var parsedUrl = url.parse(request.originalUrl, true);
                var self = this;
                if (request.getAuthDetails()['github_login_attempt_failed'] === true) {
                    // Because we bounce through authentication calls across multiple requests
                    // we use this to keep track of the fact we *Really* have failed to authenticate
                    // so that we don't keep re-trying to authenticate forever.
                    // (To clarify this infinite retry that we're stopping here would only
                    //  occur when the attempt has failed, not when it has succeeded!!!)
                    delete request.getAuthDetails()['github_login_attempt_failed'];
                    self.fail(callback);
                }
                else {
                    if (parsedUrl.query && parsedUrl.query.code) {
                        oa.getOAuthAccessToken(parsedUrl.query.code, {
                            redirect_uri: my._redirectUri
                        }, function(error, access_token, refresh_token) {
                            if (error) callback(error)
                            else {
                                request.session["access_token"] = access_token;
                                if (refresh_token) request.session["refresh_token"] = refresh_token;
                                oa.getProtectedResource("https://api.github.com/user", request.session["access_token"], function(error, data, response) {
                                    if (error) {
                                        request.getAuthDetails()['github_login_attempt_failed'] = true;
                                        self.fail(callback);
                                    }
                                    else {
                                        self.success(JSON.parse(data), callback)
                                    }
                                })
                            }
                        });
                    }
                    else if (parsedUrl.query && parsedUrl.query.error) {
                        request.getAuthDetails()['github_login_attempt_failed'] = true;
                        self.fail(callback);
                    }
                    else {
                        request.session['github_redirect_url'] = request.originalUrl;
                        var redirectUrl = oa.getAuthorizeUrl({
                            redirect_uri: my._redirectUri,
                            scope: my.scope
                        })
                        self.redirect(response, redirectUrl, callback);
                    }
                }
            }
        }
    });
};