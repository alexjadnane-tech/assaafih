import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { custom_fields } = req.body;
  if (!custom_fields || !custom_fields.edition) return res.status(400).end();

  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
  }

  const edition = Number(custom_fields.edition);
  if (!sold.includes(edition)) {
    sold.push(edition);
    fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
  }

  res.status(200).end();
}
