
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
        $scope.name = result.registrant_full_name;
        $scope.position = result.registrant_position;
        $scope.institution = result.registrant_institution;
        $scope.adress = result.registrant_adress;
        $scope.city = result.registrant_city;
        $scope.country = result.registrant_country;
        $scope.phone = result.registrant_phone;
        $scope.fax = result.registrant_fax;
        $scope.home_page = result.registrant_home_page;
        $scope.payed = result.registrant_payed;
        $scope.checked_in = result.registrant_checked_in;
        $scope.check_in_date = result.registrant_check_in_date;
        $scope.registration_date = result.registration_date;
        $scope.participation_reason = result.participation_reason;
        $scope.$apply();
    });

    $scope.$watch('checked_in', function (newValue) {
        if (newValue !== undefined) {
            OAuth.checkIn(registrant, newValue, function (result) {
                if (result['success']) {

                }
            });
        }
    }, true);
}
