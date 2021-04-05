const http = require('http');
const { STRIPE_PAYMENTS_SERVER_KEY } = require('./secrets');
const stripe = require('stripe')(STRIPE_PAYMENTS_SERVER_KEY);

const hostname = '127.0.0.1';
const port = 8000;

const server = http.createServer(async (req, res) => {
  switch (req.url) {
    case "/pay":
      const intent = await stripe.paymentIntents.create({
          amount: 200,
          currency: 'usd',
          payment_method_types: ['card'],
      });
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(intent));
    case "/save-card":
      const customers = await stripe.customers.list({ limit: 1 });
      var customer;
      if (customers.data.length < 1) {
        customer = await stripe.customers.create({
          description: 'Single Test Customer',
        });
      } else {
        customer = customers.data[0];
      }
      const setupIntent = await stripe.setupIntents.create({
        customer: customer.id,
      });
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(setupIntent));
    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end();
  }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
