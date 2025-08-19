import { Router } from 'express';

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json({ results: [] });
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'AVAX-Forge-Jobs/1.0 (+contact@example.com)'
      }
    });
    const data = await resp.json();
    const results = (data || []).map((d) => ({
      label: d.display_name,
      city: d.address?.city || d.address?.town || d.address?.village || '',
      state: d.address?.state || '',
      country: d.address?.country || '',
    }));
    return res.json({ results });
  } catch (err) {
    return res.status(500).json({ error: 'Location lookup failed' });
  }
});

export default router;


