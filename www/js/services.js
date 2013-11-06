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

    function getOAuthClient(server_id) {
        if(OAuthClients[server_id] === undefined) {
            _generateOAuthClient(getServer(server_id));
        }
        return OAuthClients[server_id];
    }

    function addOAuthToken(server_url, tokenData) {
        var servers = getServers();
        var server = servers[server_url.hashCode()];
        server.accessTokenKey = tokenData.oauth_token;
        server.accessTokenSecret = tokenData.oauth_token_secret;
        servers[server.baseUrl.hashCode()] = server;
        localStorage.setItem('servers', JSON.stringify(servers));
        _generateOAuthClient(server);
    }

    function authenticate(server_url, onSuccess) {
        var oauthClient = getOAuthClient(server_url.hashCode());
        oauthClient.fetchRequestToken(
        // Success
        function (url) {
            oauthWindow = window.open(url, '_blank', 'location=no');
            oauthWindow.addEventListener('loadstart', function (event) {
                oauthLocationChanged(event.url, oauthClient, server_url, onSuccess);
            });
        },
        failure
        );
    }

    // This function is triggered when the oauth window changes location.
    // If the new location is the callback url extract verifier from it and
    // get the access token.
    function oauthLocationChanged(url, oauthClient, server_url, onSuccess) {
        if (url.indexOf(getServer(server_url.hashCode())['callbackUrl'] + '/?') >= 0) {
            oauthWindow.close();
            // Extract oauth_verifier from the callback call
            verifier = (/[?|&]oauth_verifier=([^&;]+?)(&|#|;|$)/g).exec(url)[1];
            oauthClient.setVerifier(verifier);
            oauthClient.fetchAccessToken(
                // Success
                function (data) {
                    setAccessToken(server_url, data.text);
                    onSuccess();
                },
                failure
            );
        }
    }

    function setAccessToken(server_url, response) {
        // Extract access token/key from response
        var qvars = response.split('&');
        var accessParams = {};
        for (var i = 0; i < qvars.length; i++) {
            var y = qvars[i].split('=');
            accessParams[y[0]] = decodeURIComponent(y[1]);
        }
        addOAuthToken(server_url, accessParams);
    }

    function getEvents() {
        return JSON.parse(localStorage.getItem('events') || "{}");
    }


    function addServer(server_data, callback) {
        var servers = getServers();
        var server = server_data;
        server.callbackUrl = 'http://callback.check';
        server.requestTokenUrl = server.baseUrl + '/oauth/request_token';
        server.authorizationUrl = server.baseUrl + '/oauth/authorize';
        server.accessTokenUrl = server.baseUrl + '/oauth/access_token';
        servers[server.baseUrl.hashCode()] = server;
        localStorage.setItem('servers', JSON.stringify(servers));
        authenticate(server.baseUrl, callback);
    }

    function getServers() {
        return JSON.parse(localStorage.getItem('servers') || "{}");
    }

    function getServer(server_id) {
        return getServers()[server_id];
    }

    function getEventKey(server_url, event_id) {
        return server_url + "_" + event_id;
    }

    function getEvent(server_url, event_id) {
        return getEvents()[getEventKey(server_url, event_id)];
    }

    function _saveEvent(event) {
        var events = getEvents();
        var event_to_store = {};
        event_to_store.event_id = event.event_id;
        event_to_store.title = event.title;
        event_to_store.date = event.date;
        event_to_store.server = event.server;
        events[getEventKey(event.event_id, event.server.baseUrl)] = event_to_store;
        localStorage.setItem('events', JSON.stringify(events));
    }

    function addEvent(event, callback) {
        if(getServer(event.server.baseUrl.hashCode()) === undefined) {
            addServer(event.server, function() {
                _saveEvent(event);
                callback();
            });
        } else {
            _saveEvent(event);
            callback();
        }

    }

    function getRegistrantsForEvent(server_id, event_id, callback) {
        getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                      '/export/event/' +
                      event_id + '/registrants.json',
            function (data) {
                callback(data.results);
            },
            function (data) {
                checkOAuthError(data, function () {
                    authenticate(getServer(server_id).baseUrl, function () {
                        getRegistrantsForEvent(server_id, event_id, callback);
                    });
                });
            }
        );
    }


    function getRegistrant(server_id, event_id, registrant_id, secret, callback) {
        getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                      '/export/event/' + event_id +
                      '/registrant/' + registrant_id + '.json' +
                      '?secret=' + secret,
            function (data) {
                callback(data.results);
            },
            function (data) {
                checkOAuthError(data, function () {
                    authenticate(getServer(server_id).baseUrl, function () {
                        getRegistrant(server_id, event_id, registrant_id, secret, callback);
                    });
                });
            }
        );
    }

    function checkIn(server_id, event_id, registrant_id, secret, newValue, callback) {
        getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                      '/export/event/' + event_id +
                      '/registrant/' + registrant_id + '/checkin.json' +
                      '?secret=' + secret +
                      '&checked_in=' + (newValue? "yes": "no"),
            function (data) {
                callback(data.results);
            },
            function (data) {
                checkOAuthError(data, function () {
                    authenticate(getServer(server_id).baseUrl, function () {
                        checkIn(server_id, event_id, registrant_id, secret, newValue, callback);
                    });
                });
            }
        );
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
        console.log(data);
        parsedData = JSON.parse(data.text);
        showAlert("Error", parsedData.message, function() {});
    }

    return {
        authenticate: authenticate,
        addEvent: addEvent,
        addServer: addServer,
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
