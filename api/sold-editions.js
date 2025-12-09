import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const soldFile = path.join(process.cwd(), 'sold_editions.json');

  // Charger les éditions vendues
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try {
      sold = JSON.parse(fs.readFileSync(soldFile));
    } catch {
      sold = [];
    }
  }

  // Ajouter manuellement l’édition 1
  if (!sold.includes(1)) {
    sold.push(1);
  }

  // Sauvegarder
  fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));

  // Retourner les sold
  res.status(200).json(sold);
}
