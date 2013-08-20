
function LoadingController ($scope, $location, OAuth) {
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

function LoginController ($scope, $location, OAuth) {
    $scope.authenticate = function () {
        OAuth.authenticate(function () {
            $location.path('events');
            $scope.$apply();
        });
    };
}

function EventsController ($scope, $location, OAuth) {
    $scope.logout = function () {
        OAuth.logout();
        $location.path('login');
    };

    $scope.scan = function () {
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
}

function RegistrantController ($scope, $location, OAuth) {
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
}
