angular.module('Checkinapp.registrantController', []).controller('RegistrantController', [
  '$scope',
  '$location',
  'Storage',
  'IndicoApi',
  function ($scope, $location, Storage, IndicoApi) {
    const spinner = new Spinner({lines: 8, length: 4, width: 3, radius: 3, color: '#464646', speed: 0.7}).spin();
    $scope.loading = true;
    document.getElementById('registrant-spinner-container').appendChild(spinner.el);

    async function doCheckin(server, eventId, registrantId, value = true) {
      let result = await IndicoApi.doCheckin(server, eventId, registrantId, value);

      if (result.status === 401 || result.status === 403) {
        const reauthServer = await IndicoApi.authenticate(server, server.usePkce);
        Storage.addServer(reauthServer);

        result = await IndicoApi.doCheckin(reauthServer, eventId, registrantId, value);
      }

      if (result.status === 200 && result.checkin) {
        Storage.checkinRegistrant(server.serverId, eventId, result.checkin.registrant_id, result.checkin.checked_in);
      }

      return result;
    }

    $scope.$on('$viewContentLoaded', async function () {
      const {serverId, eventId, registrantId, checkinSecret, scanned} = $location.search();
      const server = Storage.getServer(serverId);

      try {
        let result = await IndicoApi.getRegistrant(server, eventId, registrantId);

        if (result.status === 401 || result.status === 403) {
          const reauthServer = await IndicoApi.authenticate(server, server.usePkce);
          Storage.addServer(reauthServer);

          result = await IndicoApi.getRegistrant(reauthServer, eventId, registrantId);
        }

        if (result.status === 404) {
          throw new Error('Registration not found');
        }

        if (result.registrant.checkin_secret !== checkinSecret) {
          throw new Error('The checkin secret of the QR code does not match that of the registrant');
        }

        $scope.registrant = result.registrant;
        if (Storage.getAutoCheckin() && scanned) {
          if (!$scope.registrant.checked_in) {
            const result = await doCheckin(server, eventId, registrantId);

            $scope.registrant.checkin_date = result.checkin.checkin_date;
            $scope.registrant.checked_in = result.checkin.checked_in;
          } else {
            showAlert('Warning', 'That person is already checked in.');
          }
        }

      } catch (e) {
        showAlert('Error', `There was a problem retrieving the attendee: ${e.message}`, () => {
          window.history.back();
        });
      }

      spinner.stop();
      $scope.loading = false;
      $scope.$apply();
    });

    $scope.checkinRegistrant = async function ($event) {
      const currentValue = angular.element($event.currentTarget).hasClass('toggled');
      const {serverId, eventId, registrantId} = $location.search();
      const server = Storage.getServer(serverId);

      const result = await doCheckin(server, eventId, registrantId, !currentValue);

      $scope.registrant.checkin_date = result.checkin.checkin_date;
      $scope.registrant.checked_in = result.checkin.checked_in;
      $scope.$apply();
    };
  }
]);
