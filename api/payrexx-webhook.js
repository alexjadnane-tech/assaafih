export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { referenceId, status } = req.body;

    // On vérifie que le paiement est réussi
    if (status !== "confirmed" && status !== "authorized") {
      return res.json({ ok: true });
    }

    // numéro d'édition = référence envoyée par ton bouton
    const edition = Number(referenceId);

    if (!edition) {
      return res.status(400).json({ error: "No edition provided" });
    }

    // Charger sold.json
    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(process.cwd(), "public", "sold.json");
    const soldData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Marquer comme vendu
    soldData[edition] = true;

    // Écrire le fichier
    fs.writeFileSync(filePath, JSON.stringify(soldData, null, 2));

    return res.json({ success: true, edition });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
