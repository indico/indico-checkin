/* This file is part of Indico check-in.
 * Copyright (C) 2002 - 2013 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico check-in; if not, see <http://www.gnu.org/licenses/>.
 */

angular.module('Checkinapp.services', []).
    service('OAuth', function () {

    var user = null;
    var OAuthClients = {};
    var oauthWindow;

    function _generateOAuthClient(server) {
        var oauthClient = OAuth(server);
        oauthClient.accessTokenKey = server.accessTokenKey;
        oauthClient.accessTokenSecret = server.accessTokenSecret;
        OAuthClients[server.baseUrl.hashCode()] = oauthClient;
    }

    function _generateOAuth2Client(server) {
        // Initate the library
        hello.init({
            indico: {
                id: server.consumerKey,
                oauth: {
                    version: 2,
                    auth: server.auth_url,
                    grant: server.token_url
                },
                base: server.baseUrl + '/'
            }
        }, {
            redirect_uri : server.callbackUrl
        });
    }

    function _checkHelloJSInitialization(server_id) {
        if(hello.settings.redirect_uri != 'http://localhost/') {
            _generateOAuth2Client(getServer(server_id));
        }
    }

    function getOAuthClient(server_id) {
        if(OAuthClients[server_id] === undefined) {
            if(getServer(server_id).is_oauth2) {
                _generateOAuth2Client(getServer(server_id));
            }
            else {
                _generateOAuthClient(getServer(server_id));
            }
        }
        return OAuthClients[server_id];
    }

    function addOAuthToken(server_id, tokenData) {
        var servers = getServers();
        var server = servers[server_id];
        server.accessTokenKey = tokenData.oauth_token;
        server.accessTokenSecret = tokenData.oauth_token_secret;
        servers[server.baseUrl.hashCode()] = server;
        localStorage.setItem('servers', JSON.stringify(servers));
        _generateOAuthClient(server);
    }

    function authenticate(server_id, onSuccess) {
        var oauthClient = getOAuthClient(server_id);
        if(getServer(server_id).is_oauth2) {
            hello('indico').login().then(onSuccess, function(e) {
                _deleteServer(server_id);
            });
        }
        else {
            oauthClient.fetchRequestToken(
            // Success
            function (url) {
                // The timeout has to be set for IOS because will not work properly
                setTimeout(function () {
                    oauthWindow = window.open(url, '_blank', 'location=no');
                    oauthWindow.addEventListener('loadstart', function (event) {
                        oauthLocationChanged(event.url, oauthClient, server_id, onSuccess);
                    });
                    oauthWindow.addEventListener('loaderror', function(event) {
                        showAlert('Error', event.message, function () {
                            _deleteServer(server_id);
                            oauthWindow.close();
                            oauthWindow = null;
                        });
                    });
                }, 500);
            },
            failure
            );
        }
    }

    // This function is triggered when the oauth window changes location.
    // If the new location is the callback url extract verifier from it and
    // get the access token.
    function oauthLocationChanged(url, oauthClient, server_id, onSuccess) {
        if (url.indexOf(getServer(server_id)['callbackUrl'] + '?') >= 0) {
            oauthWindow.close();
            // Extract oauth_verifier from the callback call
            verifier = (/[?|&]oauth_verifier=([^&;]+?)(&|#|;|$)/g).exec(url)[1];
            oauthClient.setVerifier(verifier);
            oauthClient.fetchAccessToken(
                // Success
                function (data) {
                    setAccessToken(server_id, data.text);
                    onSuccess();
                },
                failure
            );
        }
    }

    function setAccessToken(server_id, response) {
        // Extract access token/key from response
        var qvars = response.split('&');
        var accessParams = {};
        for (var i = 0; i < qvars.length; i++) {
            var y = qvars[i].split('=');
            accessParams[y[0]] = decodeURIComponent(y[1]);
        }
        addOAuthToken(server_id, accessParams);
    }

    function getEvents() {
        return JSON.parse(localStorage.getItem('events') || "{}");
    }


    function addServer(server_data, callback) {
        var servers = getServers();
        var server = server_data;
        var server_id = server.baseUrl.hashCode();
        server.is_oauth2 = server.hasOwnProperty('auth_url');
        server.callbackUrl = 'http://localhost/';
        server.requestTokenUrl = server.baseUrl + '/oauth/request_token';
        server.authorizationUrl = server.baseUrl + '/oauth/authorize';
        server.accessTokenUrl = server.baseUrl + '/oauth/access_token';
        servers[server_id] = server;
        localStorage.setItem('servers', JSON.stringify(servers));
        authenticate(server_id, callback);
    }

    function _deleteServer(server_id) {
        var servers = getServers();
        delete servers[server_id];
        localStorage.setItem('servers', JSON.stringify(servers));
        return true;
    }

    function _updateServer(server_data, callback) {
        var servers = getServers();
        var server_id = server_data.baseUrl.hashCode();
        servers[server_id].consumerKey =  server_data.consumerKey;
        servers[server_id].consumerSecret = server_data.consumerSecret;
        localStorage.setItem('servers', JSON.stringify(servers));
        authenticate(server_id, callback);
        return true;
    }

    function getServers() {
        return JSON.parse(localStorage.getItem('servers') || "{}");
    }

    function getServer(server_id) {
        return getServers()[server_id];
    }

    function getEventKey(server_id, event_id) {
        return server_id + "_" + event_id;
    }

    function getEvent(server_id, event_id) {
        return getEvents()[getEventKey(server_id, event_id)];
    }

    function _saveEvent(event) {
        var events = getEvents();
        var event_to_store = {};
        var server_id = event.server.baseUrl.hashCode();
        event_to_store.event_id = event.event_id;
        event_to_store.title = event.title;
        event_to_store.date = event.date;
        event_to_store.server_id = server_id;
        events[getEventKey(server_id, event.event_id)] = event_to_store;
        localStorage.setItem('events', JSON.stringify(events));
    }

    function addEvent(event, callback) {
        if(getServer(event.server.baseUrl.hashCode()) === undefined) {
            addServer(event.server, function() {
                _saveEvent(event);
                callback();
            });
        } else {
            _updateServer(event.server, function() {
                _saveEvent(event);
                callback();
            });
        }
    }

    function deleteEvent(server_id, event_id) {
        var events = getEvents();
        delete events[getEventKey(server_id, event_id)];
        localStorage.setItem('events', JSON.stringify(events));
        return true;
    }

    function getRegistrantsForEvent(server_id, event_id, callback) {
        if(getServer(server_id).is_oauth2) {
            _checkHelloJSInitialization(server_id);
            hello('indico').api('/api/events/' + event_id + '/registrants')
                .then(function (data) {
                    callback(data);
                }, function (data) {
                    checkOAuthError(data, function () {
                        authenticate(server_id, function () {
                            getRegistrantsForEvent(server_id, event_id, callback);
                        });
                    });
                }
            );
        }
        else {
            getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                          '/export/event/' +
                          event_id + '/registrants.json',
                function (data) {
                    callback(data.results);
                },
                function (data) {
                    checkOAuthError(data, function () {
                        authenticate(server_id, function () {
                            getRegistrantsForEvent(server_id, event_id, callback);
                        });
                    });
                }
            );
        }
    }


    function getRegistrant(server_id, event_id, registrant_id, checkin_secret, callback) {
        if(getServer(server_id).is_oauth2) {
            _checkHelloJSInitialization(server_id);
            hello('indico').api('/api/events/' + event_id + '/registrants/' + registrant_id)
            .then(function (data) {
                // Check if checkin_secret (from QR code) is the same as the one you just received.
                if(checkin_secret == data.checkin_secret) {
                    callback(data);
                }
                else {
                    showAlert("Error", "The secret key of the QR code does not match the key of the registrant.",
                        function() {
                            window.history.back();
                        });
                }
            }, function (data) {
                checkOAuthError(data, function () {
                    authenticate(server_id, function () {
                        getRegistrant(server_id, event_id, registrant_id, callback);
                    });
                });
            });
        }
        else {
            getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                          '/export/event/' + event_id +
                          '/registrant/' + registrant_id + '.json',
                function (data) {
                    callback(data.results);
                },
                function (data) {
                    checkOAuthError(data, function () {
                        authenticate(server_id, function () {
                            getRegistrant(server_id, event_id, registrant_id, callback);
                        });
                    });
                }
            );
        }
    }

    function checkIn(server_id, event_id, registrant_id, checkin_secret, newValue, callback) {
        if(getServer(server_id).is_oauth2) {
            _checkHelloJSInitialization(server_id);
            hello('indico').api('/api/events/' + event_id + '/registrants/' + registrant_id, 'PATCH',
                    {checked_in: newValue})
            .then(function (data) {
                callback(data);
            }, function (data) {
                checkOAuthError(data, function () {
                    authenticate(server_id, function () {
                        checkIn(server_id, event_id, registrant_id, secret, newValue, callback);
                    });
                });
            });
        }
        else {
            getOAuthClient(server_id).post(getServer(server_id).baseUrl +
                          '/api/event/' + event_id +
                          '/registrant/' + registrant_id + '/checkin.json',
                {
                    "secret": checkin_secret,
                    "checked_in": (newValue? "yes": "no"),
                },
                function (data) {
                    var data = JSON.parse(data.text || "{}");
                    callback(data.results);
                },
                function (data) {
                    checkOAuthError(data, function () {
                        authenticate(server_id, function () {
                            checkIn(server_id, event_id, registrant_id, secret, newValue, callback);
                        });
                    });
                }
            );
        }
    }

    function checkOAuthError(data, callback) {
        var parsedData = JSON.parse(data.text);
        if(parsedData._type == "OAuthError" && parsedData.code == 401) {
            callback();
        } else {
            showAlert("Error", parsedData.message, function() {});
        }
    }

    // In case of failure print error message
    function failure(data) {
        parsedData = JSON.parse(data.text);
        showAlert("Error", parsedData.message, function() {});
    }

    return {
        authenticate: authenticate,
        addEvent: addEvent,
        addServer: addServer,
        deleteEvent: deleteEvent,
        getEvents: getEvents,
        getEvent: getEvent,
        getRegistrantsForEvent: getRegistrantsForEvent,
        getRegistrant: getRegistrant,
        checkIn: checkIn,
        getUser: function () {
            return user;
        }
    };
});
