import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const soldFile = path.join(process.cwd(), 'public', 'sold_editions.json');

  try {
    const body = req.body;
    const edition = Number(body.custom_fields?.edition || body.description?.match(/édition (\d+)/)?.[1]);
    if (!edition) return res.status(400).json({ error: 'Edition missing' });

    let sold = [];
    if (fs.existsSync(soldFile)) {
      try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
    }

    if (!sold.includes(edition)) {
      sold.push(edition);
      fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
    }

    console.log(`✅ Édition ${edition} vendue via webhook`);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
