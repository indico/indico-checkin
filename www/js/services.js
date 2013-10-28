angular.module('Checkinapp.services', []).
    service('OAuth', function () {

    var user = null;
    var OAuthClients = {};
    var oauthWindow;

    String.prototype.hashCode = function(){
        var hash = 0;
        if (this.length == 0) return hash;
            for (i = 0; i < this.length; i++) {
                char = this.charCodeAt(i);
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    function getOAuthClient(server_id) {
        return OAuthClients[server_id];
    }

    function addOAuthClient(server) {
        OAuthClients[server.baseUrl.hashCode()] = OAuth(server);
    }

    function addOAuthToken(server_url, tokenData) {
        OAuthClients[server_url.hashCode()].accessTokenKey = tokenData.oauth_token;
        OAuthClients[server_url.hashCode()].accessTokenSecret = tokenData.oauth_token_secret;
    }

    function authenticate(server_url, onSuccess) {
        getOAuthClient(server_url.hashCode()).fetchRequestToken(
        // Success
        function (url) {
            oauthWindow = window.open(url, '_blank', 'location=no');
            oauthWindow.addEventListener('loadstart', function (event) {
                oauthLocationChanged(event.url, getOAuthClient(server_url.hashCode()), server_url, onSuccess);
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
        return JSON.parse(localStorage.getItem('events'));
    }

    function addServer(server_data, callback) {
        var servers = JSON.parse(localStorage.getItem('servers'));
        if(servers===null) servers = {};
        var server = {};
        server.baseUrl = server_data.baseUrl;
        server.callbackUrl = 'http://callback.check';
        server.requestTokenUrl = server_data.baseUrl + '/oauth/request_token';
        server.authorizationUrl = server_data.baseUrl + '/oauth/authorize';
        server.accessTokenUrl = server_data.baseUrl + '/oauth/access_token';
        server.consumerKey = server_data.consumerKey;
        server.consumerSecret = server_data.consumerSecret;
        servers[server.baseUrl.hashCode()] = server;
        localStorage.setItem('servers', JSON.stringify(servers));

        if(getOAuthClient(server.baseUrl.hashCode())===undefined) {
            addOAuthClient(server);
        }
        authenticate(server.baseUrl, callback);
    }

    function getServer(server_id) {
        return JSON.parse(localStorage.getItem('servers') || "{}")[server_id];
    }

    function getEventKey(event) {
        return event.server + "_" + event.id;
    }

    function addEvent(event, callback) {
        var events = JSON.parse(localStorage.getItem('events'));
        if(events===null) events = [];
        var event_to_store = {};
        event_to_store.id = event.id;
        event_to_store.title = event.title;
        event_to_store.date = event.date;
        event_to_store.server = event.server;
        events.push(event_to_store);
        localStorage.setItem('events', JSON.stringify(events));
        if(getServer(event.server.baseUrl.hashCode()) === undefined) {
            addServer(event.server, callback);
        } else {
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
            failure
        );
    }


    function checkIn(server_id, event_id, registrant, newValue, callback) {
        console.log(server_id);
        getOAuthClient(server_id).getJSON(getServer(server_id).baseUrl +
                      '/export/event/' + event_id +
                      '/registrant/' + registrant['id'] + '/checkin.json' +
                      '?secret=' + registrant['secret'] +
                      '&checked_in=' + newValue? "yes": "no",
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
        addOAuthClient: addOAuthClient,
        authenticate: authenticate,
        addEvent: addEvent,
        addServer: addServer,
        getEvents: getEvents,
        getRegistrantsForEvent: getRegistrantsForEvent,
        checkIn: checkIn,
        getUser: function () {
            return user;
        }
    };
});
