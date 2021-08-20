angular.module('Checkinapp.registrantsController', []).controller('RegistrantsController', [
  '$routeParams',
  '$scope',
  '$location',
  '$filter',
  'Storage',
  'IndicoApi',
  function ($routeParams, $scope, $location, $filter, Storage, IndicoApi) {
    const REGISTRANTS_STEP = 50;
    const {event: eventId, server: serverId} = $routeParams;
    const {title} = Storage.getEvent(serverId, eventId);
    const server = Storage.getServer(serverId);
    let allRegistrants = Storage.getRegistrants(serverId, eventId);
    let filteredRegistrants = allRegistrants;

    $scope.$emit('changeTitle', title);

    $scope.$on('$viewContentLoaded', async function () {
      const spinner = new Spinner({lines: 8, length: 4, width: 3, radius: 3, color: '#464646', speed: 0.7}).spin();
      $scope.loading = true;

      document.getElementById('spinner-container').appendChild(spinner.el);

      try {
        let result = await IndicoApi.getRegistrants(server, eventId);

        if (result.status === 401 || result.status === 403) {
          const reauthServer = await IndicoApi.authenticate(server, server.usePkce);
          Storage.addServer(reauthServer);

          result = await IndicoApi.getRegistrants(reauthServer, eventId);
        }

        $scope.loading = false;
        allRegistrants = result.registrants;

      } catch (e) {
        showAlert('Error', `There was a problem retrieving the attendee list: ${e.message}`);
        $location.path('events');
      }

      $scope.updateRegistrants();
      $scope.$apply();
    });

    $scope.updateRegistrants = function() {
      if ($scope.filter && $scope.filter.length > 2) {
        filteredRegistrants = $filter('filter')(allRegistrants, {full_name: $scope.filter});
        filteredRegistrants = $filter('orderBy')(filteredRegistrants, 'personal_data.surname + personal_data.firstName');
      } else {
        filteredRegistrants = $filter('orderBy')(allRegistrants, 'personal_data.surname + personal_data.firstName');
      }
      const displayedRegistrants = $filter('limitTo')(filteredRegistrants, REGISTRANTS_STEP, 0);
      $scope.totalCount = allRegistrants.length;
      $scope.registrants = displayedRegistrants;
    };

    $scope.showMoreRegistrants = function() {
      const next = $scope.registrants.length;
      $scope.registrants = [...$scope.registrants, ...filteredRegistrants.slice(next, next + REGISTRANTS_STEP)];
    };

    $scope.goToRegistrant = function (registrant) {
      const {server: serverId, event: eventId} = $routeParams;
      const {registrant_id: registrantId, checkin_secret: checkinSecret} = registrant;

      $location.path('registrant').search({serverId, eventId, registrantId, checkinSecret});
    };

    $scope.isRegistrantListEmpty = function () {
      return !$scope.loading && angular.equals([], allRegistrants);
    };

    $scope.updateRegistrants();
  }
]);
