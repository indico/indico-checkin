function RegistrantsController($routeParams, $scope, $location, Storage, IndicoApi) {
  $scope.$on('$viewContentLoaded', async function () {
    $scope.loading = true;
    const {event: eventId, server: serverId} = $routeParams;
    const {title} = Storage.getEvent(serverId, eventId);
    const server = Storage.getServer(serverId);

    try {
      let result = await IndicoApi.getRegistrants(server, eventId);

      if (result.status === 401 || result.status === 403) {
        const reauthServer = await IndicoApi.authenticate(server, server.usePkce);
        Storage.addServer(reauthServer);

        result = await IndicoApi.getRegistrants(reauthServer, eventId);
      }

      $scope.loading = false;
      $scope.registrants = result.registrants;
      $scope.$emit('changeTitle', title);
    } catch (e) {
      showAlert('Error', `There was a problem retrieving the attendee list: ${e.message}`);
      $location.path('events');
    }

    $scope.$apply();
  });

  $scope.goToRegistrant = function (registrant) {
    const {server: serverId, event: eventId} = $routeParams;
    const {registrant_id: registrantId, checkin_secret: checkinSecret} = registrant;

    $location.path('registrant').search({serverId, eventId, registrantId, checkinSecret});
  };

  $scope.isRegistrantListEmpty = function () {
    return angular.equals([], $scope.registrants);
  };
}
