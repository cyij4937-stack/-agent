require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const Zernio = require('@zernio/node').default || require('@zernio/node');

if (!process.env.ZERNIO_API_KEY) {
  throw new Error(
    'ZERNIO_API_KEY is not set. Copy .env.example to .env and fill in your key (never commit .env).'
  );
}

module.exports = new Zernio();
