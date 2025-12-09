import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const file = path.join(process.cwd(), 'orders.json');
  if (!fs.existsSync(file)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(file));
  res.json(orders);
}
