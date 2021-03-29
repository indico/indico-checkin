// This file is part of Indico.
// Copyright (C) 2002 - 2021 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

const app = {
  initialize: function () {
    this.bindEvents();
  },

  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    document.addEventListener('offline', this.checkConnection, false);
    document.addEventListener('online', this.checkConnection, false);
  },

  onDeviceReady: function () {
    app.receivedEvent('deviceready');
  },

  receivedEvent: function () {},

  checkConnection: function () {
    if (navigator.connection.type === Connection.NONE) {
      showAlert('No network connection detected. Check settings.');
    }
  },
};

angular
  .module('Checkinapp', [
    'ngTouch',
    'ngRoute',
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
      .otherwise({
        redirectTo: '/',
      });
  });
