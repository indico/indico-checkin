
function NavigationController($scope, $location, OAuth) {
    // We are not refreshing the page, so we need to manually
    // toggle the dropdown menu with a click event.
    function toggleNavigation() {
        if (jQuery('.navbar-toggle').is(":visible")) {
            jQuery('.navbar-toggle').click();
        }
    }

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
        toggleNavigation();
        $location.path('events');
    };

    $scope.scan = function () {
        toggleNavigation();
        scanQRCode(function(registrant){
            $location.path('registrant').search(registrant);
            $scope.$apply();
        });
    };

    $scope.addEvent = function () {
        toggleNavigation();
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
