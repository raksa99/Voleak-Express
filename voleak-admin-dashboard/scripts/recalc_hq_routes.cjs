const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://muqgtennllxkckxxqibm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cWd0ZW5ubGx4a2NreHhxaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MjA4MTIsImV4cCI6MjEwMjI5NjgxMn0.fZbLIe0KG9NpdZpKhKMI0DKyw2rg_JFfYgeDyOZSJcM'
);

// Top Sports Textile HQ in Bavet, Svay Rieng
const HQ = {
  name: 'Top Sports Textile HQ',
  lat: 11.0479485,
  lng: 106.1204302,
  address: 'https://maps.app.goo.gl/TmcZJHpCzd3KCjEr7 Top Sports Textile',
};

const NEAK_LOEUNG_BRIDGE = [105.2812, 11.2585];
const PHNOM_PENH_CENTRAL = [104.9282, 11.5564];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getDrivingDistance(destLng, destLat) {
  const straightDist = haversineKm(HQ.lat, HQ.lng, destLat, destLng);
  // If destination is within 2 km (like Elite right next door), return local zone distance
  if (straightDist < 2.0) {
    return {
      distanceKm: Number(Math.max(0.2, straightDist).toFixed(1)),
      durationHours: 0.1,
      durationMin: 5,
    };
  }

  // Domestic route waypoints through Cambodia
  const waypoints = [];
  if (destLng < 105.1) {
    // Cross Mekong via NR1 Neak Loeung Bridge
    waypoints.push(NEAK_LOEUNG_BRIDGE);
    if (destLat > 12.0) {
      waypoints.push(PHNOM_PENH_CENTRAL);
    }
  }

  const allPoints = [[HQ.lng, HQ.lat], ...waypoints, [destLng, destLat]];
  const coordStr = allPoints.map((p) => p.join(',')).join(';');

  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=false`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes[0]) {
        const km = Number((data.routes[0].distance / 1000).toFixed(1));
        const hours = Number((data.routes[0].duration / 3600).toFixed(1));
        const mins = Math.round(hours * 60);
        return { distanceKm: km, durationHours: hours, durationMin: mins };
      }
    }
  } catch (err) {
    console.warn('OSRM fallback for coords:', destLat, destLng, err.message);
  }

  // Fallback: Winding road coefficient (~1.25x straight line)
  const roadKm = Number((straightDist * 1.25).toFixed(1));
  const roadHours = Number((roadKm / 55).toFixed(1));
  const roadMins = Math.round(roadHours * 60);
  return { distanceKm: roadKm, durationHours: roadHours, durationMin: roadMins };
}

async function run() {
  console.log('Fetching all 32 hubs, corridors, and cooperators from Supabase...');

  const { data: hubs, error: hubErr } = await supabase.from('operators').select('*');
  if (hubErr) throw hubErr;

  const { data: routes, error: routeErr } = await supabase.from('routes').select('*');
  if (routeErr) throw routeErr;

  const { data: cooperators, error: copErr } = await supabase.from('cooperators').select('*');
  if (copErr) throw copErr;

  console.log(`Loaded ${hubs.length} hubs, ${routes.length} routes, ${cooperators.length} cooperators.`);

  let updatedCount = 0;

  for (const hub of hubs) {
    const lat = Number(hub.latitude);
    const lng = Number(hub.longitude);
    const province = hub.province || 'Cambodia';

    // Extract short name from hub.name like "[8 Star] Phnom Penh Logistics Hub"
    const match = hub.name.match(/\[(.*?)\]/);
    const shortName = match ? match[1] : hub.name;

    const routeName = `Top Sports HQ ⇄ ${shortName} (${province})`;

    console.log(`Calculating driving distance from Top Sports HQ to ${shortName} (${province}) @ ${lat}, ${lng}...`);
    const stats = await getDrivingDistance(lng, lat);
    console.log(`  -> ${stats.distanceKm} km, ${stats.durationHours} hrs (${stats.durationMin} mins)`);

    // Match route by operator_id or id
    const routeId = 'r-' + hub.id.replace('hub-', '');
    const stops = [
      'Top Sports Textile Central Staging Base',
      province === 'Svay Rieng' ? 'Manhattan SEZ Logistics Gate' : 'NR1 Neak Loeung Toll Plaza',
      `[${shortName}] Factory Loading Bay`,
    ];

    // 1. Update/Upsert Route (Corridor) in Supabase
    const { error: rtUpErr } = await supabase.from('routes').upsert({
      id: routeId,
      operator_id: hub.id,
      name: routeName,
      origin: 'Top Sports Textile HQ',
      destination: `[${shortName}] ${hub.name}`,
      distance_km: stats.distanceKm,
      duration_min: stats.durationMin,
      duration_hours: stats.durationHours,
      status: 'active',
      stops: stops,
    });
    if (rtUpErr) console.error('Error updating route:', routeId, rtUpErr.message);

    // 2. Update matching Cooperator
    const matchingCop = cooperators.find(
      (c) => c.operator_id === hub.id || c.short_name?.toLowerCase() === shortName.toLowerCase()
    );
    if (matchingCop) {
      const { error: copUpErr } = await supabase
        .from('cooperators')
        .update({
          primary_corridor: routeName,
          hub_name: hub.name,
        })
        .eq('id', matchingCop.id);
      if (copUpErr) console.error('Error updating cooperator:', matchingCop.id, copUpErr.message);
    }

    updatedCount++;
    // Small delay to be polite to OSRM public API
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\nSUCCESS: Successfully updated ${updatedCount} corridors and cooperators from Top Sports Textile HQ!`);
}

run().catch(console.error);
