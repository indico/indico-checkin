angular.module('Checkinapp.services', []).
    service('OAuth', function() {

    var user = {};
    var oauth = OAuth(options);
    var oauthWindow;

    function authenticate (onSuccess) {
        oauth.fetchRequestToken(
        // Success
        function (url) {
            oauthWindow = window.open(url, '_blank', 'location=no');
            oauthWindow.addEventListener('loadstart', function(event) {
                oauthLocationChanged(event.url, onSuccess);
            });
        },
        failure
        );
    }

    function logout () {
        localStorage.removeItem('userId');
        localStorage.removeItem('oAuthData');
    }

    // This function is triggered when the oauth window changes location.
    // If the new location is the callback url extract verifier from it and
    // get the access token.
    function oauthLocationChanged(url, onSuccess) {
        if (url.indexOf(options['callbackUrl'] + '/?') >= 0) {
            oauthWindow.close();
            // Extract oauth_verifier from the callback call
            verifier = (/[?|&]oauth_verifier=([^&;]+?)(&|#|;|$)/g).exec(url)[1];
            oauth.setVerifier(verifier);
            oauth.fetchAccessToken(
                // Success
                function (data) {
                    // Extract user id from the received data
                    userId = (/[?|&]user_id=([^&;]+?)(&|#|;|$)/g).exec(data.text)[1];
                    setUser(userId);
                    setAccessToken(data.text);
                    onSuccess();
                },
                failure
            );
        }
    }

    function setUser (userId) {
        oauth.getJSON(options['baseUrl'] + '/export/user/' + userId + '.json',
            function (data) {
                user = data.results[0];
                localStorage.setItem('userId', user['id']);
            },
            failure
        );
    }

    function setAccessToken (params) {
        // Extract access token/key from response
        var qvars = params.split('&');
        var accessParams = {};
        for (var i = 0; i < qvars.length; i++) {
            var y = qvars[i].split('=');
            accessParams[y[0]] = decodeURIComponent(y[1]);
        }
        // Save access token/key in localStorage
        var accessData = {};
        accessData.accessTokenKey = accessParams.oauth_token;
        accessData.accessTokenSecret = accessParams.oauth_token_secret;
        localStorage.setItem('oAuthData', JSON.stringify(accessData));
    }

    function ifAuthenticated (ifTrue, ifFalse) {
        if (!loadLocalStoredData()) {
            ifFalse();
            return;
        }
        oauth.getJSON(options['baseUrl'] + '/export/user/' + user['id'] + '.json',
            ifTrue,
            ifFalse
        );
    }

    function loadLocalStoredData () {
        var userId = localStorage.getItem('userId');
        var oauthDataRaw = localStorage.getItem('oAuthData');
        if (userId && oauthDataRaw) {
            user['id'] = userId;
            oauthData = JSON.parse(oauthDataRaw);
            options.accessTokenKey = oauthData.accessTokenKey;
            options.accessTokenSecret = oauthData.accessTokenSecret;
            oauth = OAuth(options);
            return true;
        } else {
            return false;
        }
    }

    // In case of failure print error message
    function failure (data) {
        console.log(data);
    }

    function getRegistrant (registrant, callback) {
        oauth.getJSON(options['baseUrl'] +
                      '/export/registrant/' +
                      registrant['id'] + '.json' +
                      '?target=' + registrant['target'] +
                      '&secret=' + registrant['secret'],
            function (data) {
                callback(data.results);
            },
            failure
        );
    }

    function checkIn (registrant, newValue, callback) {
        oauth.getJSON(options['baseUrl'] +
                      '/export/checkin/' +
                      registrant['id'] + '.json' +
                      '?target=' + registrant['target'] +
                      '&secret=' + registrant['secret'] +
                      '&checked_in=' + newValue,
            function (data) {
                callback(data.results);
            },
            failure
        );
    }

    return {
        authenticate: authenticate,
        logout: logout,
        ifAuthenticated: ifAuthenticated,
        getRegistrant: getRegistrant,
        checkIn: checkIn,
        getUser: function () {
            return user;
        }
    };
});
