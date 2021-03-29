// This file is part of Indico.
// Copyright (C) 2002 - 2021 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

function NavigationController($scope, $location, Storage, IndicoApi) {
  const scanQRCode = (callback) => {
    cordova.plugins.barcodeScanner.scan(
      (result) => {
        try {
          if (!result.cancelled) callback(JSON.parse(result.text));
        } catch {
          showAlert('Invalid QR');
        }
      },
      (error) => {
        showAlert('Scanning error', error);
      },
    );
  };

  $scope.doCheckin = () => {
    scanQRCode((data) => {
      const eventId = data.event_id;
      const serverId = getKey(data.server_url);
      const registrantId = data.registrant_id;
      const checkinSecret = data.checkin_secret;

      if (!eventId || !serverId || !registrantId || !checkinSecret) {
        showAlert('That QR is not a valid Indico check-in');
        return;
      }

      const event = Storage.getEvent(serverId, eventId);
      if (!event) {
        showAlert('No event for that ticket', 'Make sure you scan the event QR first');
        return;
      }

      $location.path('registrant').search({ serverId, eventId, registrantId, checkinSecret });
      $scope.$apply();
    });
  };

  $scope.addEvent = function () {
    scanQRCode(async (data) => {
      const eventData = {
        eventId: data.event_id,
        serverId: getKey(data.server?.base_url),
        title: data.title,
        date: data.date,
      };

      if (Object.values(eventData).some((i) => typeof i === 'undefined')) {
        showAlert('That QR is not a valid Indico event');
        return;
      }

      // if the server for that event is not in our list, initialize it
      const server = Storage.getServer(eventData.serverId);
      if (!server || !server.token) {
        let serverData = {};

        try {
          serverData = await IndicoApi.getServerData(data.server, data.version);
        } catch (e) {
          console.error(e);
          showAlert('There was a problem decoding that QR');
          return;
        }

        try {
          const authenticatedServer = await IndicoApi.authenticate(serverData, serverData.usePkce);
          Storage.addServer(authenticatedServer);
        } catch (e) {
          console.error(e);
          showAlert('Authentication problem');
          return;
        }
      }

      // add the new event only if it is not already in our list
      if (Storage.getEvent(eventData.serverId, eventData.eventId)) {
        showAlert('This event is already in the list');
        return;
      } else {
        Storage.addEvent(eventData);
      }

      $location.path('events');
      $scope.$apply();
    });
  };

  $scope.isCurrentLocation = function (location) {
    return location === $location.path();
  };

  $scope.allEvents = function () {
    $location.path('events');
  };

  $scope.back = function () {
    window.history.back();
  };

  $scope.$on('changeTitle', function (event, title) {
    $scope.title = title;
  });
}
