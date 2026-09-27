/**
 * Vercel Serverless Function: /api/dagps-track
 * Proxies real-time GPS telemetry from DAGPS server (bypasses CORS)
 * With auto session-renewal when the token expires.
 */

// Module-level cache so the mds token survives across warm lambda invocations
let cachedSession = {
  mds: 'b3ed6981433e4fdfb60a35d5fa511002',
  loginId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
  lastRefreshed: 0,
};

async function autoLoginToDagps(account = '0967982573', password = '123456') {
  try {
    const res = await fetch('http://www.dagps.net/LoginByUser.aspx?method=loginSystem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        userName: account,
        pwd: password,
        loginType: 'ENTERPRISE',
        language: 'en',
      }).toString(),
    });
    const text = await res.text();
    const mdsMatch = text.match(/mds=([a-zA-Z0-9]+)/);
    const loginIdMatch = text.match(/login_id=([a-zA-Z0-9\-]+)/);
    if (mdsMatch) {
      cachedSession.mds = mdsMatch[1];
      cachedSession.lastRefreshed = Date.now();
    }
    if (loginIdMatch) {
      cachedSession.loginId = loginIdMatch[1];
    }
    console.log('[DAGPS API] Auto-login done, mds:', cachedSession.mds);
    return cachedSession;
  } catch (e) {
    console.error('[DAGPS API] Auto-login error:', e.message);
    return cachedSession;
  }
}

async function queryDagps(mds, schoolId, mapType = 'GOOGLE', option = 'en') {
  const targetUrl = `http://www.dagps.net/TrackService.aspx?method=getUserAndGPSInfoUtc&school_id=${schoolId}&custid=${schoolId}&mds=${mds}&mapType=${mapType}&option=${option}&currentid=${schoolId}&custTreeCheck=false`;
  const fetchRes = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Referer': 'http://www.dagps.net/user/main.html',
    },
  });
  return await fetchRes.text();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const {
    mds: queryMds,
    school_id,
    custid,
    mapType = 'GOOGLE',
    option = 'en',
  } = req.query;

  let mds = queryMds || cachedSession.mds;
  let schoolId = school_id || custid || cachedSession.loginId || '09fa24a6-a6e4-4fcf-9de8-2564774a92c7';

  try {
    let body = await queryDagps(mds, schoolId, mapType, option);

    // Detect expired/invalid session and auto-renew
    if (!body || body.includes('logout.aspx') || body.trim().length === 0 || body.trim() === '{}') {
      console.log('[DAGPS API] Session expired — auto-renewing...');
      const renewed = await autoLoginToDagps();
      mds = renewed.mds;
      schoolId = renewed.loginId || schoolId;
      body = await queryDagps(mds, schoolId, mapType, option);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(body);
  } catch (err) {
    console.error('[DAGPS API] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
