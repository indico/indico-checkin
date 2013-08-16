
var options = {
    baseUrl: 'http://pcituds01.cern.ch:8000/indico',
    callbackUrl: 'http://callback.check',
    requestTokenUrl: 'http://pcituds01.cern.ch:8000/indico/oauth/request_token',
    authorizationUrl: 'http://pcituds01.cern.ch:8000/indico/oauth/authorize',
    accessTokenUrl: 'http://pcituds01.cern.ch:8000/indico/oauth/access_token',
    consumerKey: 'f37AlKoUJOFmnmiIR4kacXyCkW3cCDYkpwISmzKZ',
    consumerSecret: 'JBbTLmRI0VRhPPfCO5PFJ3RWN0U139SiqDfKfU0R'
};

var app = {
    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },

    receivedEvent: function (id) {
        angular.bootstrap(document, ['Checkinapp']);
    }
};
