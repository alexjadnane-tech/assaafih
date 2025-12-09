import fs from 'fs';
import path from 'path';

const soldFile = path.join(process.cwd(), 'sold_editions.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    let sold = [];
    if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));
    return res.status(200).json(sold);
  }

  if (req.method === 'POST') {
    const { edition } = req.body;
    if (!edition) return res.status(400).json({ error: 'Edition manquante' });

    let sold = [];
    if (fs.existsSync(soldFile)) sold = JSON.parse(fs.readFileSync(soldFile));
    if (!sold.includes(Number(edition))) sold.push(Number(edition));

    fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
