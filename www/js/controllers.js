/* This file is part of Indico check-in.
 * Copyright (C) 2002 - 2013 European Organization for Nuclear Research (CERN).
 *
 * Indico is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * Indico is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Indico check-in; if not, see <http://www.gnu.org/licenses/>.
 */

angular.module('Checkinapp.controllers', [])
    // ---------------------------------------------------------------------------
    // Navigation Controller
    // ---------------------------------------------------------------------------
    .controller('NavigationController', ['$scope', '$location', '$route', 'OAuth', function($scope, $location, $route, OAuth) {

        $scope.showEvents = function () {
            $location.path('events');
        };

        $scope.showSettings = function () {
            $location.path('settings');
        };

        $scope.scanTicket = function () {
            scanQRCode(function (data) {
                console.log($scope, $location, $route, OAuth);
                if(!OAuth.getEvent(data.server_url.hashCode(), data.event_id)) {
                    showAlert('No event', "There is no event in the list for this registrant", function () {});
                    $location.path('events');
                } else {
                    $location.path('registrant').search({
                                                     "registrant_id": data.registrant_id,
                                                     "event_id": data.event_id,
                                                     "server_id": data.server_url.hashCode(),
                                                     "checkin_secret": data.checkin_secret,
                                                     "scanned": true
                                                 });
                    // reload required in case same ticket is scanned twice in a row!
                    $route.reload();
                }
                $scope.$apply();
            });
        };

        $scope.isCurrentLocation = function(location) {
            return location == $location.path();
        };

        $scope.back = function() {
            window.history.back();
        };

        $scope.$on('changeTitle', function (event, title) {
            $scope.title = title;
        });
    }])
    // ---------------------------------------------------------------------------
    // Events Controller
    // ---------------------------------------------------------------------------
    .controller('EventsController', ['$scope', '$location', 'OAuth', function($scope, $location, OAuth) {

        var events = OAuth.getEvents();
        $scope.events = Object.keys(events).map(function(key) {
            return events[key];
        });
        $scope.$emit('changeTitle', "Check-in");

        $scope.goToRegistrants = function (event_id, server_id) {
            $location.path('server/' + server_id + "/event/" + event_id);
        };

        $scope.addEvent = function () {
            scanQRCode(function (data) {
                if (!data.version){
                    // This is to support old version of QR data
                    data.server.base_url = data.server.baseUrl;
                    data.server.consumer_key = data.server.consumerKey;
                    delete data.server.baseUrl;
                    delete data.server.consumerKey;
                }
                if(OAuth.getEvent(data.server.base_url.hashCode(), data.event_id)) {
                    showAlert('Already added', "This event has been already added to the system", function () {});
                    $location.path('events');
                    $scope.$apply();
                } else {
                    OAuth.addEvent(data, function () {
                        $location.path('events');
                        $scope.$apply();
                    });
                }
            });
        };

        $scope.deleteEvent = function ($event, event_id, server_id) {
            $event.stopPropagation();
            showConfirm("Delete event", "Are you sure you want to delete the selected event?", ["Delete", "Cancel"],
                        function(buttonIndex) {
                            if(buttonIndex == 1) {
                                if(OAuth.deleteEvent(server_id, event_id)) {
                                    $location.path('events');
                                }
                                $scope.editMode = false;
                                $scope.$apply();
                            }
                        }
            );
        };

        $scope.isEventListEmpty = function () {
           return angular.equals([], $scope.events);
        };
    }])
    // ---------------------------------------------------------------------------
    // Settings Controller
    // ---------------------------------------------------------------------------
    .controller('SettingsController', ['$routeParams', '$scope', '$location', 'OAuth', function($routeParams, $scope, $location, OAuth) {

        $scope.autoCheckIn = OAuth.getAutoCheckIn();
        $scope.searching = false;
        $scope.$emit('changeTitle', "Settings");

        $scope.toggleAutoCheckIn = function($event) {
            var toggled =  angular.element($event.currentTarget).hasClass("toggled");
            OAuth.setAutoCheckIn(!toggled);
            $scope.autoCheckIn = OAuth.getAutoCheckIn();
        };

    }])
    // ---------------------------------------------------------------------------
    // Registrants Controller
    // ---------------------------------------------------------------------------
    .controller('RegistrantsController', ['$routeParams', '$scope', '$location', '$filter', 'OAuth', function($routeParams, $scope, $location, $filter, OAuth) {

        $scope.event_id = $routeParams.event;
        $scope.server_id = $routeParams.server.toString();
        $scope.loading = true;
        $scope.$emit("changeTitle", OAuth.getEvent($scope.server_id, $scope.event_id).title);

        var allRegistrants = OAuth.getRegistrantsForEventFromCache($scope.server_id, $scope.event_id);
        var filteredRegistrants = allRegistrants;
        var spinner = new Spinner({
                                    lines: 8, // The number of lines to draw
                                    length: 4, // The length of each line
                                    width: 3, // The line thickness
                                    radius: 3, // The radius of the inner circle
                                    color: '#464646', // CSS color or array of colors
                                    speed: 0.7, // Rounds per second
                                    }).spin();
        document.getElementById("registrants-spinner-container").appendChild(spinner.el);

        $scope.updateRegistrants = function() {
            if ($scope.filter && $scope.filter.length > 2) {
                filteredRegistrants = $filter('filter')(allRegistrants, {full_name: $scope.filter});
                filteredRegistrants = $filter('orderBy')(filteredRegistrants, 'personal_data.surname + personal_data.firstName');
            } else {
                filteredRegistrants = $filter('orderBy')(allRegistrants, 'personal_data.surname + personal_data.firstName');
            }
            var displayedRegistrants = $filter('limitTo')(filteredRegistrants, 50, 0);
            $scope.totalCount = allRegistrants.length;
            $scope.registrants = displayedRegistrants;
        };

        $scope.showMoreRegistrants = function() {
            var next = $scope.registrants.length;
            for (var i = next; i < next+50 && filteredRegistrants[i]; i++) {
                $scope.registrants.push(filteredRegistrants[i]);
            }
        };

        OAuth.getRegistrantsForEvent($scope.server_id, $scope.event_id, function (result) {
            if(result === undefined || result.registrants === undefined) {
                $location.path('events');
            } else {
                allRegistrants = result.registrants;
            }
            spinner.stop();
            $scope.loading = false;
            $scope.updateRegistrants();
            $scope.$apply();
        });

        $scope.goToRegistrant = function (registrant) {
            $location.path('registrant').search({"registrant_id": registrant.registrant_id,
                                                 "event_id": $scope.event_id,
                                                 "server_id": $scope.server_id,
                                                 "checkin_secret": registrant.checkin_secret
                                                });
        };

        $scope.isRegistrantListEmpty = function () {
           return !$scope.loading && angular.equals([], allRegistrants);
        };

        $scope.updateRegistrants();
    }])
    // ---------------------------------------------------------------------------
    // Registrant Controller
    // ---------------------------------------------------------------------------
    .controller('RegistrantController', ['$scope', '$location', 'OAuth', function($scope, $location, OAuth) {

        var data = $location.search();
        var spinner = new Spinner({
                                    lines: 8, // The number of lines to draw
                                    length: 4, // The length of each line
                                    width: 3, // The line thickness
                                    radius: 3, // The radius of the inner circle
                                    color: '#464646', // CSS color or array of colors
                                    speed: 0.7, // Rounds per second
                                    }).spin();
        $scope.loading = true;
        $scope.registrant = OAuth.getRegistrantFromCache(data.server_id, data.event_id, data.registrant_id, data.checkin_secret);
        document.getElementById("registrant-spinner-container").appendChild(spinner.el);

        OAuth.getRegistrant(data.server_id, data.event_id, data.registrant_id, data.checkin_secret, function (registrant) {
            if(registrant === undefined){
                showAlert('Error', "It seems there has been a problem retrieving the attendee data", function () {});
                $location.path('events');
            } else {
                $scope.registrant = registrant;
                $scope.registrant.registration_date = formatDate(registrant.registration_date);
                if(registrant.checkin_date) {
                    $scope.registrant.checkin_date = formatDate(registrant.checkin_date);
                }
                // auto check-in only if called after scanning and enabled in settings
                if (data.scanned && OAuth.getAutoCheckIn() && !registrant.checked_in) {
                    OAuth.checkIn(data.server_id, data.event_id, data.registrant_id, data.checkin_secret, true, function (result) {
                        $scope.registrant.checkin_date = formatDate(result.checkin_date);
                        $scope.registrant.checked_in = result.checked_in;
                        $scope.$apply();
                    });
                } else if (data.scanned && OAuth.getAutoCheckIn()) {
                    showAlert('Warning', "The person is already checked in. Maybe the ticket has been used twice?", function () {});
                }
            }
            spinner.stop();
            $scope.loading = false;
            $scope.$apply();
        });

        $scope.checkinRegistrant = function($event) {
            var toggled =  angular.element($event.currentTarget).hasClass("toggled");
            OAuth.checkIn(data.server_id, data.event_id, data.registrant_id, data.checkin_secret, !toggled, function (result) {
                $scope.registrant.checkin_date = formatDate(result.checkin_date);
                $scope.registrant.checked_in = result.checked_in;
                $scope.$apply();
            });
        };

    }]);
