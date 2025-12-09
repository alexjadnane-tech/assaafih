import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { edition } = req.body; // Payrexx peut renvoyer le custom field edition
  if (!edition) return res.status(400).json({ error: 'Edition manquante' });

  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile, 'utf-8')); } 
    catch { sold = []; }
  }

  if (!sold.includes(Number(edition))) {
    sold.push(Number(edition));
    fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
  }

  return res.status(200).json({ ok: true });
}
