import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // --- Vérifier que c'est un événement de paiement réussi
    // Selon Payrexx, la structure est: body.data.payment.status
    if (!body?.data?.payment || body.data.payment.status !== 'success') {
      return res.status(200).json({ ok: true }); // on ignore les paiements non réussis
    }

    // --- Récupérer le numéro d’édition
    // Suppose que tu as mis le numéro dans payment.purpose
    const purpose = body.data.payment.purpose; // ex: "Edition 12"
    const match = purpose?.match(/\d+/);
    if (!match) {
      console.error('Impossible de récupérer l’édition depuis Payrexx:', purpose);
      return res.status(400).json({ error: 'Édition introuvable' });
    }

    const editionNumber = Number(match[0]);

    // --- Chemin vers le fichier JSON
    const soldFile = path.join(process.cwd(), 'sold_editions.json');
    let sold = [];
    if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));

    // --- Ajouter si pas déjà vendu
    if (!sold.includes(editionNumber)) {
      sold.push(editionNumber);
      fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
      console.log('Edition sold updated:', editionNumber);
    } else {
      console.log('Edition déjà vendue:', editionNumber);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erreur webhook Payrexx:', err);
    res.status(500).json({ error: err.message });
  }
}
