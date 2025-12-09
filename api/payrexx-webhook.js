import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body;

  try {
    // body contient toutes les infos de la commande Payrexx
    const edition = body.custom_fields?.edition;
    if (!edition) {
      console.error('Webhook: edition manquante', body);
      return res.status(400).json({ error: 'Edition manquante' });
    }

    // --- Mettre à jour sold_editions.json
    const soldFile = path.join(process.cwd(), 'sold_editions.json');
    let sold = [];
    if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));
    if (!sold.includes(Number(edition))) {
      sold.push(Number(edition));
      fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
    }

    // --- Sauvegarder la commande
    const ordersFile = path.join(process.cwd(), 'orders.json');
    let orders = [];
    if (fs.existsSync(ordersFile)) orders = JSON.parse(fs.readFileSync(ordersFile));
    orders.push({
      edition: Number(edition),
      customer_name: body.customer?.name || '',
      customer_email: body.customer?.email || '',
      address: body.customer?.address || '',
      phone: body.customer?.phone || '',
      created: new Date().toISOString(),
    });
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    // --- Répondre à Payrexx
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
