var options = {
    // baseUrl should point to Indico's main URL
    baseUrl: 'http://example.com:8000/indico',
    // callbackUrl should NOT be changed. It is used as a trigger in the OAuth
    // process. The value is not important but should not match an existing URL
    callbackUrl: 'http://callback.check',
    // requestTokenUrl is used by OAuth to get the request token
    requestTokenUrl: 'http://example.com:8000/indico/oauth/request_token',
    // authorizationURL is used by OAuth during the authentication
    authorizationUrl: 'http://example.com:8000/indico/oauth/authorize',
    // accessTokenUrl is used by OAuth to obtain the access token
    accessTokenUrl: 'http://example.com:8000/indico/oauth/access_token',
    // The consumer key and secret used by OAuth
    consumerKey: 'iHcIIWXT1xONeu0UPTDGdVCNCxdgOg1NLTuDCxmL',
    consumerSecret: 'OnpK2NxJXTvSQh2xboEf5Xyz5hTQZ4Ve9TvOSaY6'
};
