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

angular.module('Checkinapp', ['ui.bootstrap', 'Checkinapp.services']).
    config(function ($routeProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'partials/events.html',
            controller: 'EventsController'
        }).
        when('/server/:server/event/:event', {
            templateUrl: 'partials/registrants.html',
            controller: 'RegistrantsController'
        }).
        when('/registrant', {
            templateUrl: 'partials/registrant.html',
            controller: 'RegistrantController'
        }).
        otherwise({
            redirectTo: '/'
        });
    });
