import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'public', 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(filePath)) {
    try { sold = JSON.parse(fs.readFileSync(filePath)); } catch {}
  }
  res.status(200).json(sold);
}
