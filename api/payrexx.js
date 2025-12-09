import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { edition } = req.body;
  if (!edition) return res.status(400).json({ error: 'Edition manquante' });

  // Vérifier que l’édition n’est pas déjà vendue
  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));
  if (sold.includes(Number(edition))) return res.status(400).json({ error: 'Cette édition est déjà vendue.' });

  try {
    const baseUrl = process.env.BASE_URL;

    const response = await fetch(`https://${process.env.PAYREXX_INSTANCE}.payrexx.com/api/v1.0/Payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.PAYREXX_API_KEY,
        amount: 700,
        currency: 'CHF',
        description: `Carnet édition #${edition}`,
        purpose: `Edition ${edition}`,
        success_redirect_url: `${baseUrl}/success.html?edition=${edition}`,
        failed_redirect_url: `${baseUrl}/cancel.html`,
        fields: { name: true, email: true, phone: true, address: true, country: true, comment: true }
      })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } 
    catch { return res.status(500).json({ error: 'Réponse Payrexx invalide', details: text }); }

    if (!data.data || !data.data.link) return res.status(500).json({ error: 'Erreur Payrexx', details: data });

    res.status(200).json({ url: data.data.link });
  } catch (err) {
    console.error('Payrexx error:', err);
    res.status(500).json({ error: err.message });
  }
}
