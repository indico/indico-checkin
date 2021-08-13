angular.module('Checkinapp.settingsController', []).controller('SettingsController', [
  '$scope',
  'Storage',
  function ($scope, Storage) {
    $scope.autoCheckin = Storage.getAutoCheckin();
    $scope.searching = false;
    $scope.$emit('changeTitle', 'Settings');

    $scope.toggleAutoCheckin = function ($event) {
      const value = angular.element($event.currentTarget).hasClass('toggled');
      Storage.setAutoCheckin(!value);
      $scope.autoCheckin = !value;
    };
  }
]);
