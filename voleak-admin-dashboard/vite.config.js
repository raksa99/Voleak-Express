import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function mapsResolverPlugin() {
  return {
    name: 'maps-resolver',
    configureServer(server) {
      server.middlewares.use('/api/resolve-maps-location', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing url' }));
            return;
          }

          let lat = null;
          let lng = null;
          let placeName = '';

          // 1. Direct coordinates check
          const directMatch = targetUrl.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
          if (directMatch) {
            lat = parseFloat(directMatch[1]);
            lng = parseFloat(directMatch[2]);
          }

          // 2. HTTP redirect resolution
          if (targetUrl.startsWith('http')) {
            const fetchRes = await fetch(targetUrl, {
              redirect: 'follow',
              headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            const finalUrl = fetchRes.url;
            const text = await fetchRes.text();

            const dataCoordMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
            if (dataCoordMatch) {
              lat = parseFloat(dataCoordMatch[1]);
              lng = parseFloat(dataCoordMatch[2]);
            }

            if (!lat) {
              const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
              if (atMatch) {
                lat = parseFloat(atMatch[1]);
                lng = parseFloat(atMatch[2]);
              }
            }

            const placeMatch = finalUrl.match(/place\/([^/@?]+)/);
            if (placeMatch) {
              try {
                placeName = decodeURIComponent(decodeURIComponent(placeMatch[1])).replace(/\+/g, ' ');
              } catch {
                placeName = placeMatch[1].replace(/\+/g, ' ');
              }
            }

            if (!lat || !lng) {
              const centerMatch =
                text.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/) ||
                text.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
              if (centerMatch) {
                lat = parseFloat(centerMatch[1]);
                lng = parseFloat(centerMatch[2]);
              }
            }

            if (!placeName) {
              const textPlaceMatch = text.match(/maps\/place\/([^/@?]+)/);
              if (textPlaceMatch) {
                try {
                  placeName = decodeURIComponent(decodeURIComponent(textPlaceMatch[1])).replace(/\+/g, ' ');
                } catch {
                  placeName = textPlaceMatch[1].replace(/\+/g, ' ');
                }
              }
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ lat, lng, placeName, targetUrl }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // DAGPS Auto-login and Session Management
      let cachedDagpsSession = {
        mds: 'b3ed6981433e4fdfb60a35d5fa511002',
        loginId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
        accountPhone: '0967982573',
        lastRefreshed: Date.now(),
      };

      async function autoLoginToDagps(accountPhone = '0967982573', password = '123456') {
        try {
          const res = await fetch('http://www.dagps.net/LoginByUser.aspx?method=loginSystem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              userName: accountPhone,
              pwd: password,
              loginType: 'ENTERPRISE',
              language: 'en',
            }),
          });
          const text = await res.text();
          const mdsMatch = text.match(/mds=([a-zA-Z0-9]+)/);
          const loginIdMatch = text.match(/login_id=([a-zA-Z0-9\-]+)/);
          if (mdsMatch) {
            cachedDagpsSession.mds = mdsMatch[1];
            cachedDagpsSession.lastRefreshed = Date.now();
          }
          if (loginIdMatch) {
            cachedDagpsSession.loginId = loginIdMatch[1];
          }
          console.log('[DAGPS Proxy] Auto-login succeeded, new mds:', cachedDagpsSession.mds);
          return cachedDagpsSession;
        } catch (e) {
          console.error('[DAGPS Proxy] Auto-login error:', e);
          return cachedDagpsSession;
        }
      }

      // Explicit login endpoint
      server.middlewares.use('/api/dagps-login', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const user = urlObj.searchParams.get('account') || '0967982573';
          const pwd = urlObj.searchParams.get('password') || '123456';
          const session = await autoLoginToDagps(user, pwd);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, ...session }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // DAGPS Real-time Telemetry Proxy with Auto-Renewal
      server.middlewares.use('/api/dagps-track', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          let mds = urlObj.searchParams.get('mds') || cachedDagpsSession.mds;
          let school_id = urlObj.searchParams.get('school_id') || cachedDagpsSession.loginId || '09fa24a6-a6e4-4fcf-9de8-2564774a92c7';
          let custid = urlObj.searchParams.get('custid') || school_id;
          const mapType = urlObj.searchParams.get('mapType') || 'GOOGLE';
          const option = urlObj.searchParams.get('option') || 'en';
          const currentid = urlObj.searchParams.get('currentid') || custid;

          const queryTrack = async (targetMds, targetSchoolId) => {
            const targetUrl = `http://www.dagps.net/TrackService.aspx?method=getUserAndGPSInfoUtc&school_id=${targetSchoolId}&custid=${targetSchoolId}&mds=${targetMds}&mapType=${mapType}&option=${option}&currentid=${targetSchoolId}&custTreeCheck=false`;
            const fetchRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Referer': 'http://www.dagps.net/user/main.html',
              },
            });
            return await fetchRes.text();
          };

          let body = await queryTrack(mds, school_id);

          // If session expired or invalid, auto-login to renew session and retry!
          if (!body || body.includes('logout.aspx') || body.trim().length === 0) {
            console.log('[DAGPS Proxy] Session expired or invalid, refreshing token via auto-login...');
            const renewed = await autoLoginToDagps();
            if (renewed.mds) {
              mds = renewed.mds;
              school_id = renewed.loginId || school_id;
              body = await queryTrack(mds, school_id);
            }
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(body);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mapsResolverPlugin()],
  server: {
    port: 3000,
    host: true,
    open: false,
  },
});
