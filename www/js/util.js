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

function showAlert(title, text, callback) {
    navigator.notification.alert(text, callback, title);
};

function showConfirm(title, text, buttonLabels, callback) {
    navigator.notification.confirm(text, callback, title, buttonLabels);
};

function scanQRCode(callback) {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if (!result.cancelled) {
                // The timeout has to be set for IOS because will not work properly
                callback(JSON.parse(result.text));
            }
        },
        function (error) {
            showAlert("Error scanning", error, function () {});
        },
        {
            showFlipCameraButton: false,
            showTorchButton: true,
            prompt: "Place the QR-Code inside the rectangle.",
            formats: "QR_CODE",
            resultDisplayDuration: 0
        }
    );
};

String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length === 0) {
        return hash;
    }
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

function formatDate(date) {
    if(date) {
        return moment(date).format('DD/MM/YYYY HH:mm');
    }
    return null;
}
