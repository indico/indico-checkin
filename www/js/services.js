angular.module('Checkinapp.services', []).
    service('OAuth', function () {

    var user = null;
    var oauth = OAuth(options);
    var oauthWindow;

    function authenticate(onSuccess) {
        oauth.fetchRequestToken(
        // Success
        function (url) {
            oauthWindow = window.open(url, '_blank', 'location=no');
            oauthWindow.addEventListener('loadstart', function (event) {
                oauthLocationChanged(event.url, onSuccess);
            });
        },
        failure
        );
    }

    function logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('oAuthData');
        user = null;
        // Logout the user from inAppBrowser window used by OAuth
        logoutWindow = window.open(options['baseUrl'] + '/user/logout',
                                   '_blank', 'location=no');
        logoutWindow.addEventListener('loadstop', function (event) {
                logoutWindow.close();
        });
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
                    setAccessToken(data.text);
                    // Extract user id from the received data
                    userId = (/[?|&]user_id=([^&;]+?)(&|#|;|$)/g).exec(data.text)[1];
                    // Call onSuccess after user data is retrieved
                    setUser(userId, onSuccess);
                },
                failure
            );
        }
    }

    function setUser(userId, callback) {
        oauth.getJSON(options['baseUrl'] + '/export/user/' + userId + '.json',
            function (data) {
                user = data.results[0];
                localStorage.setItem('user', JSON.stringify(user));
                callback();
            },
            failure
        );
    }

    function setAccessToken(response) {
        // Extract access token/key from response
        var qvars = response.split('&');
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

    function ifAuthenticated(ifTrue, ifFalse) {
        if (!loadLocalStoredData()) {
            ifFalse();
            return;
        }
        oauth.getJSON(options['baseUrl'] + '/export/user/' + user['id'] + '.json',
            ifTrue,
            ifFalse
        );
    }

    function loadLocalStoredData() {
        user = JSON.parse(localStorage.getItem('user'));
        var oauthDataRaw = localStorage.getItem('oAuthData');
        if (user && oauthDataRaw) {
            oauthData = JSON.parse(oauthDataRaw);
            options.accessTokenKey = oauthData.accessTokenKey;
            options.accessTokenSecret = oauthData.accessTokenSecret;
            oauth = OAuth(options);
            return true;
        } else {
            return false;
        }
    }

    function getEvents(callback) {
        oauth.getJSON(options['baseUrl'] +
                      '/export/events/' +
                      user['id'] + '.json',
            function (data) {
                callback(data.results);
            },
            failure
        );
    }

    function getRegistrantsForEvent(event_id, callback) {
        oauth.getJSON(options['baseUrl'] +
                      '/export/registrants/' +
                      event_id + '.json',
            function (data) {
                callback(data.results);
            },
            failure
        );
    }

    function getRegistrant(registrant, callback) {
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

    function checkIn(registrant, newValue, callback) {
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

    // In case of failure print error message
    function failure(data) {
        console.log(data);
        parsedData = JSON.parse(data.text);
        alert(parsedData.message);
    }

    return {
        authenticate: authenticate,
        logout: logout,
        ifAuthenticated: ifAuthenticated,
        getEvents: getEvents,
        getRegistrantsForEvent: getRegistrantsForEvent,
        getRegistrant: getRegistrant,
        checkIn: checkIn,
        getUser: function () {
            return user;
        }
    };
});
