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
                    callback(JSON.parse(result.text));
                }
            },
            function (error) {
                console.log(error);
            }
        );
    }

    $scope.allEvents = function () {
        $location.path('events');
    };

    $scope.scan = function () {
        scanQRCode(function(registrant){
            $location.path('registrant').search(registrant);
            $scope.$apply();
        });
    };

    $scope.addEvent = function () {
        scanQRCode(function(event) {
            OAuth.addEvent(event, function () {
                $location.path('events');
                $scope.$apply();
            });
        });
    };
}

function EventsController($scope, $location, OAuth) {
    // Set events to true to hide the no events message until the get finishes

    $scope.events = OAuth.getEvents();


    $scope.go_to_registrants = function (event_id, server_id) {
        $location.path('server/'+ server_id.hashCode() + "/event/" + event_id);
    };
}

function RegistrantsController($routeParams, $scope, $location, OAuth) {

    $scope.event_id = $routeParams.event;
    $scope.server_id = $routeParams.server.toString();

    OAuth.getRegistrantsForEvent($scope.server_id, $scope.event_id, function (result) {
        $scope.registrants = result.registrants;
        $scope.$apply();
    });

    $scope.go_to_registrant = function (registrant) {
        $location.path('registrant').search({"registrant": registrant,
                                             "event_id": $scope.event_id,
                                             "server_id": $scope.server_id,
                                            });
    };
}

function RegistrantController($scope, $location, OAuth) {
    var data = $location.search();
    $scope.registrant = data.registrant;

    $scope.$watch('registrant.checked_in', function (newValue) {
        if (newValue !== undefined) {
            OAuth.checkIn(data.server_id, data.event_id, data.registrant, newValue, function (result) {
                console.log(JSON.stringify(result));
                if (result['success']) {
                    $scope.registrant.checkin_date = result['checkin_date'];
                    $scope.$apply();
                }
            });
        }
    }, true);
}
