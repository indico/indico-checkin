function RegistrantController($scope, $location, Storage, IndicoApi) {
  $scope.$on('$viewContentLoaded', async function () {
    const {serverId, eventId, registrantId, checkinSecret} = $location.search();
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
    } catch (e) {
      showAlert('Error', `There was a problem retrieving the attendee: ${e.message}`, () => {
        window.history.back();
      });
    }

    $scope.$apply();
  });

  $scope.checkinRegistrant = async function ($event) {
    const currentValue = angular.element($event.currentTarget).hasClass('toggled');
    const {serverId, eventId, registrantId} = $location.search();
    const server = Storage.getServer(serverId);

    let result = await IndicoApi.doCheckin(server, eventId, registrantId, !currentValue);

    if (result.status === 401 || result.status === 403) {
      const reauthServer = await IndicoApi.authenticate(server, server.usePkce);
      Storage.addServer(reauthServer);

      result = await IndicoApi.doCheckin(reauthServer, eventId, registrantId, !currentValue);
    }

    $scope.registrant.checkin_date = result.checkin.checkin_date;
    $scope.registrant.checked_in = result.checkin.checked_in;
    $scope.$apply();
  };
}
