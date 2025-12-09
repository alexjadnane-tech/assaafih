import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { payment } = req.body;
  if (!payment) return res.status(400).json({ error: 'No payment info' });

  const edition = Number(payment.purpose.replace('Edition ', ''));
  if (!edition) return res.status(400).json({ error: 'Edition non trouvée' });

  const filePath = path.join(process.cwd(), 'sold_editions.json');
  let sold = [];
  if (fs.existsSync(filePath)) sold = JSON.parse(fs.readFileSync(filePath));
  if (!sold.includes(edition)) sold.push(edition);
  fs.writeFileSync(filePath, JSON.stringify(sold, null, 2));

  res.status(200).json({ ok: true });
}
