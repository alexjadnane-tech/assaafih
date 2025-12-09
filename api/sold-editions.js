import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const soldFile = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
  }
  res.status(200).json(sold);
}
