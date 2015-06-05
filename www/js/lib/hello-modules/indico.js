(function(hello) {

    hello.init({

        indico: {

            name: 'Indico',

            oauth: {
                version: 2
            },

            scope: {
                basic: 'registrants'
            },

            xhr: function(p) {

                if (p.method !== 'get' && p.data) {

                    // Serialize payload as JSON
                    p.headers = p.headers || {};
                    p.headers['Content-Type'] = 'application/json';
                    if (typeof (p.data) === 'object') {
                        p.data = JSON.stringify(p.data);
                    }
                }

                return true;
            }
        }
    });

})(hello);
