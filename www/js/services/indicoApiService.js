angular.module('Checkinapp.indicoApiService', []).service('IndicoApi', function () {
  const generateCodeChallenge = async codeVerifier => {
    const hash = await sha256(codeVerifier);
    return base64UrlEncode(hash);
  };

  const browserSignOn = (authUrl, redirectUri) =>
    new Promise((resolve, reject) => {
      const authBrowser = cordova.InAppBrowser.open(authUrl, '_blank', 'location=no');

      authBrowser.addEventListener('loadstart', e => {
        if (e.url.startsWith(redirectUri)) {
          authBrowser.close();
          // clear session cookie from browser so it's not sent on further fetches
          window.cookies.clear();
          resolve(e.url);
        }
      });

      authBrowser.addEventListener('loaderror', err => {
        authBrowser.close();
        reject(err);
      });
    });

  const authImplicitFlow = server => {
    return new Promise(async (resolve, reject) => {
      const authUrl = buildUrl(server.authUrl, {
        client_id: server.clientId,
        response_type: 'token',
        redirect_uri: server.callbackUrl,
        scope: server.scope,
      });

      try {
        const authBrowserResult = await browserSignOn(authUrl.href, server.callbackUrl);
        const {access_token: accessToken} = getSearchParams(authBrowserResult, '#');

        resolve({...server, token: accessToken});
      } catch (e) {
        reject(e);
      }
    });
  };

  const authPkceFlow = server => {
    return new Promise(async (resolve, reject) => {
      const state = generateRandomString(128);
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const authUrl = buildUrl(server.authUrl, {
        response_type: 'code',
        client_id: server.clientId,
        redirect_uri: server.callbackUrl,
        state,
        scope: server.scope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      try {
        const authBrowserResult = await browserSignOn(authUrl.href, server.callbackUrl);
        const {code, state: responseState, error} = getSearchParams(authBrowserResult);

        if (error || !code || state !== responseState) reject();

        const tokenResponse = await fetch(server.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: urlEncodeForm({
            grant_type: 'authorization_code',
            client_id: server.clientId,
            redirect_uri: server.callbackUrl,
            code,
            code_verifier: codeVerifier,
          }),
        });
        const data = await tokenResponse.json();

        resolve({...server, token: data.access_token});
      } catch (e) {
        reject(e);
      }
    });
  };

  function authenticate(server, usePkce = false) {
    if (usePkce) {
      return authPkceFlow(server);
    } else {
      return authImplicitFlow(server);
    }
  }

  async function getServerData(server, version) {
    if (!version) {
      throw new Error('Incompatible QR.');
    }

    switch (version) {
      case 1:
        return {
          serverId: getKey(server.base_url),
          clientId: server.consumer_key,
          baseUrl: server.base_url,
          authUrl: server.auth_url,
          tokenUrl: server.token_url,
          scope: 'registrants',
          callbackUrl: 'http://localhost',
        };

      default: {
        const oAuthDiscoveryUrl = `${server.base_url}/.well-known/oauth-authorization-server`;
        const res = await fetch(oAuthDiscoveryUrl);
        const data = await res.json();

        return {
          serverId: getKey(server.base_url),
          clientId: server.client_id,
          baseUrl: server.base_url,
          authUrl: data.authorization_endpoint,
          tokenUrl: data.token_endpoint,
          scope: server.scope,
          usePkce: true,
          callbackUrl: 'http://localhost',
        };
      }
    }
  }

  async function getRegistrants(server, eventId) {
    const registrantsUrl = `${server.baseUrl}/api/events/${eventId}/registrants`;
    const res = await fetch(registrantsUrl, {
      headers: {Authorization: `Bearer ${server.token}`},
    });
    const data = await res.json();

    return {status: res.status, registrants: data.registrants};
  }

  async function getRegistrant(server, eventId, registrantId) {
    const registrantUrl = `${server.baseUrl}/api/events/${eventId}/registrants/${registrantId}`;
    const res = await fetch(registrantUrl, {
      headers: {Authorization: `Bearer ${server.token}`},
    });
    if (res.status === 404) {
      return {status: res.status};
    }

    const data = await res.json();

    return {status: res.status, registrant: data};
  }

  async function doCheckin(server, eventId, registrantId, value) {
    const checkinUrl = `${server.baseUrl}/api/events/${eventId}/registrants/${registrantId}`;
    const body = JSON.stringify({checked_in: value});
    const res = await fetch(checkinUrl, {
      headers: {'Authorization': `Bearer ${server.token}`, 'Content-Type': 'application/json'},
      method: 'PATCH',
      body,
    });
    const data = await res.json();

    return {status: res.status, checkin: data};
  }

  return {
    authenticate,
    getServerData,
    getRegistrants,
    getRegistrant,
    doCheckin,
  };
});
