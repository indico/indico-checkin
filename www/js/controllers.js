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

function NavigationController($scope, $location, OAuth) {

    function scanQRCode(callback) {
        var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");

        // This has to be used when debugging in local
        //var scanner = cordova.require("com.phonegap.plugins.barcodescanner.barcodescanner");
        scanner.scan(
            function (result) {
                if (!result.cancelled) {
                    // The timeout has to be set for IOS because will not work properly
                    callback(JSON.parse(result.text));
                }
            },
            function (error) {
                showAlert("Error scanning", error, function () {});
            }
        );
    }

    $scope.allEvents = function () {
        $location.path('events');
    };

    $scope.scan = function () {
        scanQRCode(function (data) {
            if(!OAuth.getEvent(data.event_id, data.server_url.hashCode())) {
                showAlert('No event', "There is no event in the list for this registrant", function () {});
                $location.path('events');
            } else {
                $location.path('registrant').search({"registrant_id": data.registrant_id,
                                                 "event_id": data.event_id,
                                                 "server_id": data.server_url.hashCode(),
                                                 "secret": data.secret
                                             });
            }
            $scope.$apply();
        });
    };

    $scope.addEvent = function () {
        scanQRCode(function (data) {
            if(OAuth.getEvent(data.event_id, data.server.baseUrl.hashCode())) {
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

    $scope.isCurrentLocation = function(location) {
        return location == $location.path();
    };

    $scope.back = function() {
        window.history.back();
    };

    $scope.$on('changeTitle', function (event, title) {
        $scope.title = title;
    });
}

function EventsController($scope, $location, OAuth) {
    $scope.events = OAuth.getEvents();
    $scope.$emit('changeTitle', "Indico check-in");

    $scope.go_to_registrants = function (event_id, server_id) {
        console.log(server_id, event_id);
        $location.path('server/' + server_id + "/event/" + event_id);
    };

    $scope.isEmpty = function (obj) {
       return angular.equals({}, obj);
    };
}

function RegistrantsController($routeParams, $scope, $location, OAuth) {

    $scope.event_id = $routeParams.event;
    $scope.server_id = $routeParams.server.toString();

    OAuth.getRegistrantsForEvent($scope.server_id, $scope.event_id, function (result) {
        $scope.registrants = result.registrants;
        $scope.$emit("changeTitle", OAuth.getEvent($scope.server_id, $scope.event_id).title);
        $scope.$apply();
    });

    $scope.go_to_registrant = function (registrant) {
        $location.path('registrant').search({"registrant_id": registrant.registrant_id,
                                             "event_id": $scope.event_id,
                                             "server_id": $scope.server_id,
                                             "secret": registrant.secret
                                            });
    };
}

function RegistrantController($scope, $location, OAuth) {
    var data = $location.search();

    OAuth.getRegistrant(data.server_id, data.event_id, data.registrant_id, data.secret, function (registrant) {
        $scope.$emit('changeTitle', registrant.full_name);
        $scope.registrant = registrant;
        $scope.$apply();
    });

    $scope.$watch('registrant.checked_in', function (newValue) {
        if (newValue !== undefined) {
            OAuth.checkIn(data.server_id, data.event_id, data.registrant_id, data.secret, newValue, function (result) {
                if (result.success) {
                    $scope.registrant.checkin_date = result.checkin_date;
                    $scope.$apply();
                }
            });
        }
    }, true);
}
