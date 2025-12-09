import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const event = req.body;
  console.log('--- PAYREXX WEBHOOK EVENT ---', JSON.stringify(event, null, 2));

  if (event.status === 'paid' && event.custom_fields && event.custom_fields.edition) {
    const edition = Number(event.custom_fields.edition);
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
}
