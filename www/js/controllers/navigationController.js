angular.module('Checkinapp.navigationController', []).controller('NavigationController', [
  '$scope',
  '$location',
  'Storage',
  'IndicoApi',
  function ($scope, $location, Storage, IndicoApi) {
    $scope.doCheckin = () => {
      scanQRCode(data => {
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

        $location.path('registrant').search({
          serverId,
          eventId,
          registrantId,
          checkinSecret,
          scanned: true,
        });
        $scope.$apply();
      });
    };

    $scope.addEvent = function () {
      const spinnerList = new Spinner({lines: 8, length: 4, width: 3, radius: 3, color: '#464646', speed: 0.7}).spin();
      const spinnerEmpty = new Spinner({lines: 8, length: 4, width: 3, radius: 3, color: '#464646', speed: 0.7}).spin();
      $scope.loading = true;
      document.getElementById('events-spinner-container').appendChild(spinnerList.el);
      document.getElementById('events-empty-spinner-container').appendChild(spinnerEmpty.el);

      scanQRCode(async data => {
        const eventData = {
          eventId: data.event_id,
          serverId: getKey(data.server ? data.server.base_url : null),
          title: data.title,
          date: data.date,
        };

        if (Object.values(eventData).some(i => typeof i === 'undefined')) {
          showAlert('That QR is not a valid Indico event');
          $scope.loading = false;
          $scope.$apply();
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
            showAlert(`There was a problem with that QR: ${e}`);
            $scope.loading = false;
            $scope.$apply();
            return;
          }

          try {
            const authenticatedServer = await IndicoApi.authenticate(serverData, serverData.usePkce);
            Storage.addServer(authenticatedServer);
          } catch (e) {
            console.error(e);
            showAlert(`Authentication problem: ${e.message}`);
            $scope.loading = false;
            $scope.$apply();
            return;
          }
        }

        // add the new event only if it is not already in our list
        if (Storage.getEvent(eventData.serverId, eventData.eventId)) {
          showAlert('This event is already in the list');
          $scope.loading = false;
          $scope.$apply();
          return;
        } else {
          Storage.addEvent(eventData);
        }

        $scope.loading = false;
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

    $scope.showSettings = function () {
      $location.path('settings');
    };

    $scope.back = function () {
      window.history.back();
    };

    $scope.$on('changeTitle', function (event, title) {
      $scope.title = title;
    });
  }
]);
