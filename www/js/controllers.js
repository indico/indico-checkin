
function LoadingController ($scope, $location, Auth) {
    Auth.ifAuthenticated(
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

function LoginController ($scope, $location, Auth) {
    $scope.authenticate = function () {
        Auth.authenticate(function () {
            $location.path('events');
            $scope.$apply();
        });
    };
}

function EventsController ($scope, $location, Auth) {
    $scope.logout = function () {
        Auth.logout();
        $location.path('login');
    };

    $scope.scan = function () {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan(
            function (result) {
                if (!result.cancelled) {
                    var participant = JSON.parse(result.text);
                    $location.path('participant')
                             .search(participant);
                    $scope.$apply();
                }
            },
            function (error) {
                console.log(error);
            }
        );
    };
}

function ParticipantController ($scope, $location, Auth) {
    paricipant = $location.search();
}
