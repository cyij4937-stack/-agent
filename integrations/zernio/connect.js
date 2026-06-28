// Generates the OAuth URL to connect an Instagram or Threads account to a Zernio profile.
// Instagram/Threads use the plain OAuth flow (no secondary page/org selection step).
// Usage: node connect.js instagram
//        node connect.js threads
const zernio = require('./client');

const platform = process.argv[2];
if (!platform) {
  console.error('Usage: node connect.js <instagram|threads>');
  process.exit(1);
}

const profileId = process.env.ZERNIO_PROFILE_ID;
if (!profileId) {
  throw new Error('Set ZERNIO_PROFILE_ID in .env first (create one via zernio.profiles.createProfile).');
}

(async () => {
  const { data } = await zernio.connect.getConnectUrl({
    path: { platform },
    query: {
      profileId,
      redirect_url: process.env.ZERNIO_REDIRECT_URL || 'https://zernio.com/connected',
    },
  });
  console.log(`Open this URL in a browser and authorize ${platform}:\n${data.authUrl}`);
  console.log('\nAfter authorizing, run `npm run list-accounts` to get the new account _id.');
})();
