import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;

    console.log('--- PAYREXX WEBHOOK EVENT ---');
    console.log(JSON.stringify(event, null, 2));

    // --- Exemple : vérifier que le paiement est réussi
    // Selon Payrexx, tu peux vérifier event.status ou event.paid
    if (event.status === 'paid' && event.custom_fields && event.custom_fields.edition) {
      const edition = Number(event.custom_fields.edition);

      // --- Mettre à jour sold_editions.json
      const soldFile = path.join(process.cwd(), 'sold_editions.json');
      let sold = [];
      if (fs.existsSync(soldFile)) {
        try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
      }

      if (!sold.includes(edition)) {
        sold.push(edition);
        fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
        console.log(`✅ Edition ${edition} marquée comme vendue`);
      }
    }

    res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
