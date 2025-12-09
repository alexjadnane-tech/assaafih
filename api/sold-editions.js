import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const soldFile = path.join(process.cwd(), 'public', 'sold_editions.json');
  const manualFile = path.join(process.cwd(), 'public', 'manual_sold.json');

  let sold = [];
  let manual = [];

  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
  }
  if (fs.existsSync(manualFile)) {
    try { manual = JSON.parse(fs.readFileSync(manualFile)); } catch {}
  }

  // Combiner automatique + manuel
  const allSold = Array.from(new Set([...sold, ...manual]));
  res.status(200).json(allSold);
}
