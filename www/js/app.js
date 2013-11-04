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

var app = {
    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('offline', this.checkConnection, false);
        document.addEventListener('online', this.checkConnection, false);
    },

    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },

    receivedEvent: function (id) {
    },

    checkConnection: function () {
        if (navigator.connection.type === Connection.NONE) {
            navigator.notification.alert('No network connection detected. Check settings',
                                          function() {}, "Warning");
        }
    }
};
