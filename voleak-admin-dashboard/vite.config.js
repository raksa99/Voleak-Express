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
