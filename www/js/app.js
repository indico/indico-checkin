const app = {
  initialize() {
    this.bindEvents();
  },

  bindEvents() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('offline', this.checkConnection, false);
    document.addEventListener('online', this.checkConnection, false);
  },

  onDeviceReady() {
    app.receivedEvent('deviceready');
  },

  receivedEvent() { },

  checkConnection() {
    if (navigator.connection.type === Connection.NONE) {
      showAlert('No network connection detected. Check settings.');
    }
  },
};

angular
  .module('Checkinapp', [
    'ngTouch',
    'ngRoute',
    'infinite-scroll',
    'Checkinapp.eventsController',
    'Checkinapp.navigationController',
    'Checkinapp.registrantController',
    'Checkinapp.registrantsController',
    'Checkinapp.settingsController',
    'Checkinapp.storageService',
    'Checkinapp.indicoApiService',
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/events.html',
        controller: 'EventsController',
      })
      .when('/server/:server/event/:event', {
        templateUrl: 'partials/registrants.html',
        controller: 'RegistrantsController',
      })
      .when('/registrant', {
        templateUrl: 'partials/registrant.html',
        controller: 'RegistrantController',
      })
      .when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsController'
      })
      .otherwise({
        redirectTo: '/',
      });
  });
