
angular.module('Checkinapp', ['Checkinapp.services']).
    config(function ($routeProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'partials/events.html',
            controller: 'EventsController'
        }).
        when('/events', {
            templateUrl: 'partials/events.html',
            controller: 'EventsController'
        }).
        when('/server/:server/event/:event', {
            templateUrl: 'partials/registrants.html',
            controller: 'RegistrantsController'
        }).
        when('/registrant', {
            templateUrl: 'partials/registrant.html',
            controller: 'RegistrantController'
        }).
        otherwise({
            redirectTo: '/'
        });
    });
