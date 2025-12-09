export default function handler(req, res) {
  const { edition } = req.query;
  if (!edition) return res.status(400).send('Edition manquante');

  const baseUrl = process.env.BASE_URL;
  const instance = process.env.PAYREXX_INSTANCE;
  const apiKey = process.env.PAYREXX_API_KEY;

  const payrexxUrl = `https://${instance}.payrexx.com/checkout?api_key=${apiKey}&amount=700&currency=CHF&description=Carnet+édition+${edition}&success_redirect_url=${baseUrl}/success.html&failed_redirect_url=${baseUrl}/cancel.html&custom_fields[edition]=${edition}`;

  res.redirect(payrexxUrl);
}
