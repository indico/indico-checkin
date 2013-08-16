
function LoadingController ($scope, $location, Auth) {
    Auth.ifAuthenticated(
        function () {
            $location.path('events');
            $scope.$apply();
        },
        function () {
            $location.path('login');
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
}
