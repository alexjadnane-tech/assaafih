import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(filePath)) {
    sold = JSON.parse(fs.readFileSync(filePath));
  }
  res.status(200).json(sold);
}
[]
