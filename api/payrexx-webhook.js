import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Payrexx envoie généralement un POST JSON
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;

  try {
    // --- Vérifier que c'est un paiement réussi
    if (!body || !body.data || !body.data.status || body.data.status !== 'SUCCESS') {
      return res.status(400).json({ error: 'Paiement non réussi ou données invalides' });
    }

    // --- Récupérer le numéro d'édition du custom field
    const edition = Number(body.data.fields?.edition);
    if (!edition) return res.status(400).json({ error: 'Edition manquante' });

    // --- Charger les éditions déjà vendues
    const soldFile = path.join(process.cwd(), 'sold-editions.json');
    let sold = [];
    if (fs.existsSync(soldFile)) {
      try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
    }

    // --- Ajouter l’édition si elle n’est pas déjà là
    if (!sold.includes(edition)) {
      sold.push(edition);
      fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
    }

    console.log(`Edition ${edition} marquée comme vendue`);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
