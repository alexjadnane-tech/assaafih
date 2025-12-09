import express from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static(process.cwd()));

const PORT = process.env.PORT || 5000;

// --- Fichiers JSON
const FILE_EDITIONS = path.join(process.cwd(), 'sold_editions.json');
const FILE_ORDERS = path.join(process.cwd(), 'orders.json');

function loadSold() {
  if (!fs.existsSync(FILE_EDITIONS)) return [];
  try { return JSON.parse(fs.readFileSync(FILE_EDITIONS)); } catch { return []; }
}
function saveSold(editions) {
  fs.writeFileSync(FILE_EDITIONS, JSON.stringify(editions, null, 2));
}
function loadOrders() {
  if (!fs.existsSync(FILE_ORDERS)) return [];
  try { return JSON.parse(fs.readFileSync(FILE_ORDERS)); } catch { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(FILE_ORDERS, JSON.stringify(orders, null, 2));
}

// --- Pages
app.get('/', (req, res) => res.sendFile(path.join(process.cwd(), 'index.html')));
app.get('/success', (req, res) => res.send(`<h1>Payment successful</h1><p><a href="/">Back to shop</a></p>`));
app.get('/cancel', (req, res) => res.send(`<h1>Payment canceled</h1><p><a href="/">Back to shop</a></p>`));

// --- API pour éditions vendues
app.get('/sold-editions', (req, res) => res.json(loadSold()));

// --- API Payrexx (redirection)
app.get('/api/payrexx', (req, res) => {
  const { edition } = req.query;
  if (!edition) return res.status(400).send('Edition manquante');

  const baseUrl = process.env.BASE_URL;
  const instance = process.env.PAYREXX_INSTANCE;
  const apiKey = process.env.PAYREXX_API_KEY;

  const payrexxUrl = `https://${instance}.payrexx.com/checkout?api_key=${apiKey}&amount=700&currency=CHF&description=Carnet+édition+${edition}&success_redirect_url=${baseUrl}/success.html&failed_redirect_url=${baseUrl}/cancel.html&custom_fields[edition]=${edition}`;

  res.redirect(payrexxUrl);
});

// --- API Payrexx Webhook
app.post('/api/payrexx-webhook', (req, res) => {
  const event = req.body;
  console.log('--- PAYREXX WEBHOOK EVENT ---', JSON.stringify(event, null, 2));

  if (event.status === 'paid' && event.custom_fields && event.custom_fields.edition) {
    const edition = Number(event.custom_fields.edition);
    let sold = loadSold();

    if (!sold.includes(edition)) {
      sold.push(edition);
      saveSold(sold);
      console.log(`✅ Edition ${edition} marquée comme vendue`);
    }
  }

  res.status(200).json({ received: true });
});

// --- Lancer serveur
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
