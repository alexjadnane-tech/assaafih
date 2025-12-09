import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { edition } = req.body;

  if (!edition) return res.status(400).json({ error: 'Edition manquante' });

  const soldFile = path.join(process.cwd(), 'sold.json');
  let sold = [];

  // Charger les éditions vendues
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
  }

  // Ajouter l'édition si pas déjà vendue
  if (!sold.includes(Number(edition))) {
    sold.push(Number(edition));
    fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));
  }

  res.status(200).json({ ok: true });
}
