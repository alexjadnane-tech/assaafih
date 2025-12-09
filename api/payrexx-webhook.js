import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const data = req.body;

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

  // --- 2️⃣ Enregistrement des commandes
  const ordersFile = path.join(process.cwd(), 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersFile)) orders = JSON.parse(fs.readFileSync(ordersFile));
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  // --- 3️⃣ Envoi email récapitulatif
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou autre service SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const emailText = `
Nouvelle commande reçue :

Edition : ${order.edition}
Nom : ${order.name}
Email : ${order.email}
Téléphone : ${order.phone}
Adresse : ${JSON.stringify(order.address)}
Montant : ${order.amount} ${order.currency}
Date : ${order.date}
    `;

    // Email à toi
    await transporter.sendMail({
      from: '"Assaafih Shop" <shop@example.com>',
      to: 'alexandre@alexandreadnane.com',
      subject: `Nouvelle commande édition #${order.edition}`,
      text: emailText
    });

    // Email au client
    if (order.email) {
      await transporter.sendMail({
        from: '"Assaafih Shop" <shop@example.com>',
        to: order.email,
        subject: `Confirmation de votre commande édition #${order.edition}`,
        text: `Merci pour votre achat !\n\n${emailText}`
      });
    }

  } catch (err) {
    console.error('Erreur envoi email:', err);
  }

  console.log('✅ Nouvelle commande reçue :', order);

  res.status(200).json({ received: true });
}
