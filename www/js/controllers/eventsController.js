// This file is part of Indico.
// Copyright (C) 2002 - 2021 CERN
//
// Indico is free software; you can redistribute it and/or
// modify it under the terms of the MIT License; see the
// LICENSE file for more details.

function EventsController($scope, $location, Storage) {
  $scope.events = Storage.getEvents();
  $scope.$emit('changeTitle', 'Indico check-in');

  $scope.goToRegistrants = function (serverId, eventId) {
    $location.path(`/server/${serverId}/event/${eventId}`);
  };

  $scope.deleteEvent = function ($event, serverId, eventId) {
    $event.stopPropagation();
    showConfirm(
      'Delete event',
      'Are you sure you want to delete the selected event?',
      ['Delete', 'Cancel'],
      buttonIndex => {
        if (buttonIndex === 1) {
          Storage.deleteEvent(serverId, eventId);
          $location.path('events');
          $scope.editMode = false;
          $scope.$apply();
        }
      }
    );
  };

  $scope.isEventListEmpty = function () {
    return angular.equals({}, $scope.events);
  };
}
