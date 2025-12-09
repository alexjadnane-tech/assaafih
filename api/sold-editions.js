import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // --- 1) Charger les sold manuels depuis /public/manual_sold.json
    const manualRes = await fetch(`${req.headers.host.startsWith('localhost') ? 'http://' : 'https://'}${req.headers.host}/manual_sold.json`);
    const manualSold = manualRes.ok ? await manualRes.json() : [];

    // --- 2) Récupérer les paiements Payrexx
    const PAYREXX_INSTANCE = process.env.PAYREXX_INSTANCE;
    const PAYREXX_API_KEY = process.env.PAYREXX_API_KEY;

    const url = `https://${PAYREXX_INSTANCE}.payrexx.com/api/v1/Transaction`;
    const payrexx = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': PAYREXX_API_KEY,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    let autoSold = [];

    if (payrexx && payrexx.data) {
      autoSold = payrexx.data
        .filter(t => t.status === 'confirmed')
        .map(t => Number(t.referenceId))
        .filter(n => !isNaN(n));
    }

    // --- 3) Fusion automatique + manuel
    const allSold = Array.from(new Set([...autoSold, ...manualSold]));

    res.status(200).json(allSold);
  } catch (err) {
    console.error(err);
    res.status(200).json([]); // fallback
  }
}
