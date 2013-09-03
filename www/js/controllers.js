
function NavigationController($scope, $location, OAuth) {
    // We are not refreshing the page, so we need to manually
    // toggle the dropdown menu with a click event.
    function toggleNavigation() {
        if (jQuery('.navbar-toggle').is(":visible")) {
            jQuery('.navbar-toggle').click();
        }
    }

    $scope.allEvents = function () {
        toggleNavigation();
        $location.path('events');
    };

    $scope.scan = function () {
        toggleNavigation();
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan(
            function (result) {
                if (!result.cancelled) {
                    var registrant = JSON.parse(result.text);
                    $location.path('registrant')
                             .search(registrant);
                    $scope.$apply();
                }
            },
            function (error) {
                console.log(error);
            }
        );
    };

    $scope.logout = function () {
        toggleNavigation();
        OAuth.logout();
        $location.path('login');
    };

    // If user changes, change username in menu.
    $scope.$watch(OAuth.getUser, function (user) {
        $scope.user = user;
    });
}

function LoadingController($scope, $location, OAuth) {
    OAuth.ifAuthenticated(
        // True
        function () {
            $location.path('events');
            $scope.$apply();
        },
        // False
        function () {
            $location.path('login');
            $scope.$apply();
        }
    );
}

function LoginController($scope, $location, OAuth) {
    $scope.authenticate = function () {
        OAuth.authenticate(function () {
            $location.path('events');
            $scope.$apply();
        });
    };
}

function EventsController($scope, $location, OAuth) {
    // Set events to true to hide the no events message until the get finishes
    $scope.events = true;
    OAuth.getEvents(function (result) {
        $scope.events = result.events;
        $scope.$apply();
    });

    $scope.go_to_registrants = function (event_id) {
        $location.path('registrants/' + event_id);
    };
}

function RegistrantsController($routeParams, $scope, $location, OAuth) {
    $scope.event_id = $routeParams.event;
    OAuth.getRegistrantsForEvent($scope.event_id, function (result) {
        $scope.registrants = result.registrants;
        $scope.$apply();
    });

    $scope.go_to_registrant = function (registrant_id, secret) {
        $location.path('registrant').search({"id": registrant_id,
                                             "target": $scope.event_id,
                                             "secret": secret});
    };
}

function RegistrantController($scope, $location, OAuth) {
    registrant = $location.search();
    OAuth.getRegistrant(registrant, function (result) {
        console.log(result);
        $scope.name = result.fullName;
        $scope.checked_in = result.checkedIn;
        $scope.check_in_date = result.checkInDate;
        $scope.registration_date = result.registrationDate;
        $scope.position = result.position;
        $scope.institution = result.institution;
        $scope.adress = result.adress;
        $scope.city = result.city;
        $scope.country = result.country;
        $scope.phone = result.phone;
        $scope.email = result.email;
        $scope.home_page = result.personalHomepage;
        $scope.payed = result.payed;

        $scope.$apply();
    });

    $scope.$watch('checked_in', function (newValue) {
        if (newValue !== undefined) {
            OAuth.checkIn(registrant, newValue, function (result) {
                if (result['success']) {
                    $scope.check_in_date = result['checkin_date'];
                    $scope.$apply();
                }
            });
        }
    }, true);
}
