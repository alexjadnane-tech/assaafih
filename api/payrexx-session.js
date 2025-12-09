export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { edition, method } = req.body;
  if (!edition || !method) return res.status(400).json({ error: 'Edition and method required' });

  try {
    const baseVPOS = 'https://alexandreadnane.payrexx.com/fr/vpos';

    const url = `${baseVPOS}?amount=700&currency=CHF&description=Carnet+édition+${edition}&method=${method}&success_redirect_url=${process.env.BASE_URL}/success.html&failed_redirect_url=${process.env.BASE_URL}/cancel.html`;

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
