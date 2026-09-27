/**
 * Vercel Serverless Function: /api/dagps-login
 * Authenticates to DAGPS and returns mds session token
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const account = req.query.account || '0967982573';
  const password = req.query.password || '123456';

  try {
    const loginRes = await fetch('http://www.dagps.net/LoginByUser.aspx?method=loginSystem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        userName: account,
        pwd: password,
        loginType: 'ENTERPRISE',
        language: 'en',
      }).toString(),
    });

    const text = await loginRes.text();
    const mdsMatch = text.match(/mds=([a-zA-Z0-9]+)/);
    const loginIdMatch = text.match(/login_id=([a-zA-Z0-9\-]+)/);

    const mds = mdsMatch ? mdsMatch[1] : 'b3ed6981433e4fdfb60a35d5fa511002';
    const loginId = loginIdMatch ? loginIdMatch[1] : '09fa24a6-a6e4-4fcf-9de8-2564774a92c7';

    res.status(200).json({ success: true, mds, loginId });
  } catch (err) {
    // Return the cached/fallback credentials so the app can still try
    res.status(200).json({
      success: false,
      mds: 'b3ed6981433e4fdfb60a35d5fa511002',
      loginId: '09fa24a6-a6e4-4fcf-9de8-2564774a92c7',
      error: err.message,
    });
  }
}
