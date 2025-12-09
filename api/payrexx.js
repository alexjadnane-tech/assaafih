export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { edition } = req.body;
  if (!edition) return res.status(400).json({ error: 'Edition manquante' });

  const baseUrl = process.env.BASE_URL;
  const instance = process.env.PAYREXX_INSTANCE;
  const apiKey = process.env.PAYREXX_API_KEY;

  // Construire le lien direct
  const paymentUrl = `https://${instance}.payrexx.com/checkout?api_key=${apiKey}&amount=700&currency=CHF&description=Carnet+édition+${edition}&success_redirect_url=${baseUrl}/success.html&failed_redirect_url=${baseUrl}/cancel.html`;

  return res.status(200).json({ url: paymentUrl });
}
