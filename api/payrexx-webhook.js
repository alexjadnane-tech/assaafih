import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const data = req.body;

    const filePath = path.join(process.cwd(), 'public', 'sold_editions.json');
    let sold = [];
    if (fs.existsSync(filePath)) sold = JSON.parse(fs.readFileSync(filePath));

    if (data.custom_fields && data.custom_fields.edition) {
      const edition = Number(data.custom_fields.edition);
      if (!sold.includes(edition)) sold.push(edition);
    }

    fs.writeFileSync(filePath, JSON.stringify(sold, null, 2));
    console.log('Webhook reçu:', data);
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur');
  }
}
