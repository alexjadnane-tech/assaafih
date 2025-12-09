import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;

  // Récupérer le numéro d'édition choisi
  const edition = data.custom_fields?.edition;
  const customer = data.customer || {};

  const order = {
    edition: edition ? Number(edition) : null,
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || {},
    amount: data.amount || null,
    currency: data.currency || null,
    date: new Date().toISOString()
  };

  // --- 1️⃣ Mise à jour sold_editions.json
  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));
  if (edition && !sold.includes(Number(edition))) {
    sold.push(Number(edition));
    fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
  }

  // --- 2️⃣ Enregistrement de la commande
  const ordersFile = path.join(process.cwd(), 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersFile)) orders = JSON.parse(fs.readFileSync(ordersFile));
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  console.log('✅ Nouvelle commande reçue :', order);

  res.status(200).json({ received: true });
}
