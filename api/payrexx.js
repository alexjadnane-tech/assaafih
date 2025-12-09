import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { edition } = req.body;
  if (!edition) return res.status(400).json({ error: 'Edition manquante' });

  // --- Variables d'environnement
  const BASE_URL = process.env.BASE_URL;
  const PAYREXX_INSTANCE = process.env.PAYREXX_INSTANCE;
  const PAYREXX_API_KEY = process.env.PAYREXX_API_KEY;

  console.log('--- DEBUG VARIABLES ---');
  console.log('BASE_URL:', BASE_URL);
  console.log('PAYREXX_INSTANCE:', PAYREXX_INSTANCE);
  console.log('PAYREXX_API_KEY:', PAYREXX_API_KEY ? 'OK' : 'Missing');

  if (!BASE_URL || !PAYREXX_INSTANCE || !PAYREXX_API_KEY) {
    return res.status(500).json({ 
      error: 'Variables d’environnement manquantes', 
      details: { BASE_URL, PAYREXX_INSTANCE, PAYREXX_API_KEY: PAYREXX_API_KEY ? 'OK' : 'Missing' }
    });
  }

  // --- Vérifier que l’édition n’est pas déjà vendue
  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } 
    catch { sold = []; }
  }
  if (sold.includes(Number(edition))) return res.status(400).json({ error: 'Cette édition est déjà vendue.' });

  try {
    // --- Appel Payrexx
    const response = await fetch(`https://${PAYREXX_INSTANCE}.payrexx.com/api/v1.0/Payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: PAYREXX_API_KEY,
        amount: 700,
        currency: 'CHF',
        description: `Carnet édition #${edition}`,
        purpose: `Edition ${edition}`,
        success_redirect_url: `${BASE_URL}/success.html?edition=${edition}`,
        failed_redirect_url: `${BASE_URL}/cancel.html`,
        fields: { name: true, email: true, phone: true, address: true, country: true, comment: true }
      })
    });

    const text = await response.text();
    console.log('--- PAYREXX RAW RESPONSE ---');
    console.log(text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: 'Réponse Payrexx non JSON',
        details: text
      });
    }

    if (!data.data || !data.data.link) {
      return res.status(500).json({ error: 'Pas de lien de paiement dans la réponse', details: data });
    }

    // --- Tout est OK
    res.status(200).json({ url: data.data.link });

  } catch (err) {
    console.error('Erreur API Payrexx:', err);
    res.status(500).json({ error: 'Erreur fetch Payrexx', details: err.message });
  }
}
