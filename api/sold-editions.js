import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const soldFile = path.join(process.cwd(), 'sold_editions.json');

  // --- Charger les éditions déjà vendues
  let sold = [];
  if (fs.existsSync(soldFile)) {
    try { sold = JSON.parse(fs.readFileSync(soldFile)); } catch {}
  }

  // --- Ajouter manuellement l'édition 12
  if (!sold.includes(1)) sold.push(1);

  // --- Sauvegarder le fichier
  fs.writeFileSync(soldFile, JSON.stringify(sold, null, 2));

  // --- Retourner la liste des éditions vendues
  res.status(200).json(sold);
}
