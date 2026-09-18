const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://muqgtennllxkckxxqibm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cWd0ZW5ubGx4a2NreHhxaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MjA4MTIsImV4cCI6MjEwMjI5NjgxMn0.fZbLIe0KG9NpdZpKhKMI0DKyw2rg_JFfYgeDyOZSJcM'
);

const factories = [
  { url: 'https://maps.app.goo.gl/pdjF6ZVyfeCBxqno9', name: '8 STAR SPORTSWEAR LTD.', short: '8 Star', code: '8STAR' },
  { url: 'https://maps.app.goo.gl/tRde6E834dmeitt3A', name: 'BOWKER GARMENT FACTORY (CAMBODIA) COMPANY LIMITED', short: 'Bowker', code: 'BOWKER', fallbackLat: 11.53399, fallbackLng: 104.82673, fallbackPlace: 'Bowker Garment Factory (Cambodia) Bek Chan' },
  { url: 'https://maps.app.goo.gl/mg3uV9gY4hxjurpS8', name: 'ELITE (CAMBODIA) CO., LTD', short: 'Elite', code: 'ELITE' },
  { url: 'https://maps.app.goo.gl/J4BqshSy2RbY5Gtq5', name: 'EMINENT GARMENT (CAMBODIA) LIMITED', short: 'Eminent', code: 'EMINENT' },
  { url: 'https://maps.app.goo.gl/JFWsmQJKXA846B6s6', name: 'Fortuna International (Cambodia) Industry Co., Ltd', short: 'Fortuna', code: 'FORTUNA' },
  { url: 'https://maps.app.goo.gl/hbFRJb63rdP9tssAA', name: 'Hongs One (Cambodia) Garment Co., Ltd.', short: 'Hongs One', code: 'HONGSONE' },
  { url: 'https://maps.app.goo.gl/XzCHsB5mCg414rKf9', name: 'Hung Wah (Cambodia) Garment MFG. Ltd.', short: 'Hung Wah', code: 'HUNGWAH' },
  { url: 'https://maps.app.goo.gl/kyfwoFQ67SKLGLtp7', name: 'IN JAE GARMENT CO., LTD.', short: 'In Jae', code: 'INJAE' },
  { url: 'https://maps.app.goo.gl/35HtJ81Rmhrg5XGZ6', name: 'JOINT FORCE SPORTING GOODS (CAMBODIA) CO., LTD.', short: 'Joint Force', code: 'JOINTFORCE' },
  { url: 'https://maps.app.goo.gl/nxM9M1VG9wipMcTH7', name: 'KING SUCCESS CO., LTD', short: 'King Success', code: 'KINGSUCCESS' },
  { url: 'https://maps.app.goo.gl/W5V6GqY1R25MpX5F8', name: 'KKN Apparel Co., Ltd.', short: 'KKN Apparel', code: 'KKN' },
  { url: 'https://maps.app.goo.gl/VpprSqQEfTPfLv8h6', name: 'MAKALOT GARMENTS (CAMBODIA) CO., LTD.', short: 'Makalot', code: 'MAKALOT' },
  { url: 'https://maps.app.goo.gl/FQF1rywJfkfWr49QA', name: 'Moha Garments Co. Ltd.', short: 'Moha Garments', code: 'MOHA' },
  { url: 'https://maps.app.goo.gl/PHXKcF3qv687CatFA', name: 'NYAN KIDS (CAMBODIA) Ltd.', short: 'Nyan Kids', code: 'NYANKIDS' },
  { url: 'https://maps.app.goo.gl/8bsem3Vx9y4ysauD8', name: 'OCEAN APPAREL MANUFACTURING CO., LTD.', short: 'Ocean Apparel', code: 'OCEAN' },
  { url: 'https://maps.app.goo.gl/KaRSJwoUDx2H7Bfa7', name: 'POWER GROWN FOOTWEAR (CAMBODIA) CO.,LTD', short: 'Power Grown', code: 'POWERGROWN' },
  { url: 'https://maps.app.goo.gl/1rvUmVq55aoVevNbA', name: 'Rong Win Garment Co., Ltd.', short: 'Rong Win', code: 'RONGWIN' },
  { url: 'https://maps.app.goo.gl/NzjCrLQeWGiGSikWA', name: 'Seduno Investment Cambo Fashion Co., Ltd.', short: 'Seduno', code: 'SEDUNO' },
  { url: 'https://maps.app.goo.gl/dfFWQxaxuxWHaz5B8', name: 'SIXPLUS INDUSTRY CO., LTD.', short: 'Sixplus', code: 'SIXPLUS' },
  { url: 'https://maps.app.goo.gl/BHnfNw2KeqY2RPuX9', name: 'Skyworth Fashion(Cambodia) Co., Ltd', short: 'Skyworth', code: 'SKYWORTH' },
  { url: 'https://maps.app.goo.gl/TBs99m7FeiJbi4SJ6', name: 'Starlight Apparel Manufacturing ltd.', short: 'Starlight', code: 'STARLIGHT' },
  { url: 'https://maps.app.goo.gl/tP6szikGizA1J5Vq7', name: 'SunHsu Garment Factory', short: 'SunHsu', code: 'SUNHSU' },
  { url: 'https://maps.app.goo.gl/YzWQcm2UhBc8QaTs8', name: 'SUNFAIR GARMENT CO., LTD.', short: 'Sunfair', code: 'SUNFAIR' },
  { url: 'https://maps.app.goo.gl/dmU3LCdJba1EAGxq5', name: 'T & L (Cambodia) Hanbags Industrial Co., Ltd.', short: 'T&L Handbags', code: 'TLHANDBAGS' },
  { url: 'https://maps.app.goo.gl/U5p7apvExhcHRZN68', name: 'T.F.G (CAMBODIA) GARMENT CO., LTD.', short: 'T.F.G', code: 'TFG' },
  { url: 'https://maps.app.goo.gl/uAzxTATfZZQ7XPdH7', name: 'Texson (Cambodia) Knitting Washing Dyeing & Printing Co., Ltd.', short: 'Texson', code: 'TEXSON' },
  { url: 'https://maps.app.goo.gl/jPbYu72Tue2zFZ23A', name: 'TOP SUMMIT GARMENT INC.', short: 'Top Summit', code: 'TOPSUMMIT' },
  { url: 'https://maps.app.goo.gl/ZEnjGqHi73HZ5Bnb6', name: 'TRAX APPAREL (CAMBODIA) CO., LTD.', short: 'Trax Apparel', code: 'TRAX' },
  { url: 'https://maps.app.goo.gl/2syua7ePP4Y7Gp766', name: 'Wan He Da Manufacturing Company Limited', short: 'Wan He Da', code: 'WANHEDA' },
  { url: 'https://maps.app.goo.gl/sE6hoX4r3W2zBq6A8', name: 'XO TEX Industrial Co.,Ltd', short: 'XO TEX', code: 'XOTEX' },
  { url: 'https://maps.app.goo.gl/og6r54WjxAqe33TGA', name: 'Yakjin (Cambodia) Inc.', short: 'Yakjin', code: 'YAKJIN' },
  { url: 'https://maps.app.goo.gl/B9dWFZGgEzQodtFbA', name: 'YTC CORPORATION', short: 'YTC', code: 'YTC' }
];

async function resolveLocation(f) {
  try {
    const res = await fetch(f.url, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    let lat = null, lng = null, place = '';

    const m3d = loc.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (m3d) {
      lat = parseFloat(m3d[1]);
      lng = parseFloat(m3d[2]);
    } else {
      const mat = loc.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (mat) {
        lat = parseFloat(mat[1]);
        lng = parseFloat(mat[2]);
      }
    }
    const pMatch = loc.match(/place\/([^/@?]+)/);
    if (pMatch) {
      try {
        place = decodeURIComponent(decodeURIComponent(pMatch[1])).replace(/\+/g, ' ');
      } catch {
        place = pMatch[1].replace(/\+/g, ' ');
      }
    }

    if (!lat && f.fallbackLat) {
      lat = f.fallbackLat;
      lng = f.fallbackLng;
      place = f.fallbackPlace || f.name;
    }

    return { lat, lng, placeName: place || f.name };
  } catch (err) {
    console.error('Fetch err for', f.short, err.message);
    return {
      lat: f.fallbackLat || 11.5564,
      lng: f.fallbackLng || 104.9282,
      placeName: f.fallbackPlace || f.name
    };
  }
}

function detectProvince(lat, lng) {
  if (lng > 105.7) return 'Svay Rieng';
  if (lat < 10.9 && lng < 104.2) return 'Preah Sihanouk';
  if (lng < 103.2 && lat < 12.0) return 'Koh Kong';
  if (lat > 13.0 && lng > 103.5 && lng < 104.5) return 'Siem Reap';
  if (lng < 103.2 && lat > 13.3) return 'Banteay Meanchey';
  if (lng < 103.5 && lat > 12.8) return 'Battambang';
  if (lat > 11.9 && lng > 105.0) return 'Kampong Cham';
  if (lat > 11.8 && lng < 104.8) return 'Kampong Chhnang';
  if (lng < 104.80) return 'Kampong Speu';
  if (lat >= 11.65 || lat <= 11.46 || lng >= 104.98) return 'Kandal';
  if (lat >= 11.46 && lat <= 11.65 && lng >= 104.82 && lng <= 104.96) return 'Phnom Penh';
  return 'Phnom Penh';
}

async function run() {
  console.log(`Starting clean resolution & sync for ${factories.length} factories...`);

  // Clean old temporary test records if any
  await supabase.from('cooperators').delete().in('id', ['cop-1789404925691', 'cop-1789409270704']);
  await supabase.from('operators').delete().in('id', ['hub-04925691', 'hub-1789409263384']);
  await supabase.from('routes').delete().in('id', ['r-hub-04925691', 'r-hub-1789409263384']);

  let count = 0;
  for (let i = 0; i < factories.length; i++) {
    const f = factories[i];
    const loc = await resolveLocation(f);
    const lat = loc.lat;
    const lng = loc.lng;
    const province = detectProvince(lat, lng);
    const placeTitle = loc.placeName || f.name;

    const copId = 'cop-' + f.code.toLowerCase();
    const hubId = 'hub-' + f.code.toLowerCase();
    const routeId = 'r-' + f.code.toLowerCase();

    const hubName = '[' + f.short + '] ' + province + ' Logistics Hub';
    const routeName = 'Phnom Penh HQ ⇄ ' + f.short + ' (' + province + ')';

    const R = 6371;
    const dLat = ((lat - 11.5564) * Math.PI) / 180;
    const dLon = ((lng - 104.9282) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((11.5564 * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const distKm = Math.max(8, Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
    const durHours = Number((distKm / 40).toFixed(1));
    const durMin = Math.round(durHours * 60);

    // 1. Hub (operators)
    const { error: hubErr } = await supabase.from('operators').upsert({
      id: hubId,
      name: hubName,
      code: f.code.slice(0, 6) + '-' + (101 + i),
      province: province,
      address: f.url,
      latitude: lat,
      longitude: lng,
      manager_name: f.short + ' Dispatch Operations',
      contact_phone: '+855 12 888 777',
      status: 'active',
      fleet_count: 2,
      loading_bays: 8,
      rating: 5.0
    });
    if (hubErr) console.error('Hub error for', f.short, hubErr.message);

    // 2. Corridor (routes)
    const { error: routeErr } = await supabase.from('routes').upsert({
      id: routeId,
      operator_id: hubId,
      name: routeName,
      origin: 'Phnom Penh Central Freight Hub',
      destination: '[' + f.short + '] ' + placeTitle,
      distance_km: distKm,
      duration_min: durMin,
      duration_hours: durHours,
      status: 'active',
      stops: ['Phnom Penh Central Logistics Base', province + ' Weighbridge Gate', '[' + f.short + '] Factory Loading Bay']
    });
    if (routeErr) console.error('Route error for', f.short, routeErr.message);

    // 3. Cooperator (cooperators)
    const { error: copErr } = await supabase.from('cooperators').upsert({
      id: copId,
      name: f.name,
      factory_name: placeTitle,
      short_name: f.short,
      code: 'COP-' + f.code.slice(0, 8) + '-' + String(i + 1).padStart(2, '0'),
      address: f.url,
      latitude: lat,
      longitude: lng,
      province: province,
      operator_id: hubId,
      hub_name: hubName,
      primary_corridor: routeName,
      industry: 'Garments & Textiles',
      category: 'Garment & Apparel Manufacturing',
      status: 'active',
      credit_limit: 50000.0,
      current_balance: 0.0,
      rating: 5.0,
      total_waybills: 0,
      total_tonnage: 0,
      total_spend: 0,
      cod_collected: 0,
      notes: f.name + ' • ' + f.url
    });
    if (copErr) console.error('Cooperator error for', f.short, copErr.message);

    count++;
    console.log(`[${count}/${factories.length}] Synced: ${f.short} | ${province} | (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  }

  console.log('\n=============================================');
  console.log(`SUCCESS: All ${factories.length} factories, hubs & corridors synced!`);
  console.log('=============================================');
}

run().catch(console.error);
