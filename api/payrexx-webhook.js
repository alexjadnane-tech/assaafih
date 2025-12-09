import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;

  try {
    const transaction = body.transaction;
    if (!transaction || transaction.status !== 'confirmed') {
      return res.status(400).json({ error: 'Paiement non confirmé' });
    }

    const edition = Number(transaction.invoice.products[0].sku);
    if (!edition) return res.status(400).json({ error: 'Edition manquante' });

    const soldFile = path.join(process.cwd(), 'sold-editions.json');
    let sold = [];
    if (fs.existsSync(soldFile)) {
      try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
    }

    if (!sold.includes(edition)) {
      sold.push(edition);
      fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
    }

    console.log(`Edition ${edition} marquée comme vendue via Payrexx webhook`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
