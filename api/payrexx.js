export default function handler(req, res) {
  const { edition } = req.query;
  if (!edition) return res.status(400).send('Edition manquante');

  const baseUrl = process.env.BASE_URL;
  const instance = process.env.PAYREXX_INSTANCE;
  const apiKey = process.env.PAYREXX_API_KEY;

  // --- Construction propre de l'URL avec encoding
  const params = new URLSearchParams({
    api_key: apiKey,
    amount: '700',
    currency: 'CHF',
    description: `Carnet édition ${edition}`,
    success_redirect_url: `${baseUrl}/success.html`,
    failed_redirect_url: `${baseUrl}/cancel.html`,
    'custom_fields[edition]': edition
  });

  const payrexxUrl = `https://${instance}.payrexx.com/checkout?${params.toString()}`;

  // Redirection vers Payrexx
  res.redirect(payrexxUrl);
}

