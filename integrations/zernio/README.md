# Zernio Integration

Publishes the K-beauty SEA card news (`content/kbeauty-sea-cardnews/cards/`) to Instagram and Threads via the [Zernio API](https://docs.zernio.com/).

## Setup

```bash
cp .env.example .env   # fill in ZERNIO_API_KEY — never commit this file
npm install
```

## Connect Instagram and Threads accounts

Account connection is OAuth-based and must be done once in a browser (not scriptable):

```js
const zernio = require('./client');
const { authUrl } = await zernio.connect.getConnectUrl({
  platform: 'instagram', // or 'threads'
  profileId: process.env.ZERNIO_PROFILE_ID,
});
console.log(authUrl); // open in a browser and authorize
```

Then run:

```bash
npm run list-accounts
```

and copy the resulting `_id` values into `.env` as `ZERNIO_INSTAGRAM_ACCOUNT_ID` / `ZERNIO_THREADS_ACCOUNT_ID`.

## Publish the card news

```bash
npm run post-cardnews
```

By default this creates a draft post (no `publishNow`/`scheduledFor`). Uncomment `publishNow: true` in `post-cardnews.js` to publish immediately, or add `scheduledFor`/`timezone` to schedule it.

## Known gap

Media (the 10 card PNGs) is not yet attached to the post — Zernio's media upload flow needs to be confirmed against `/guides/media-uploads` before that's wired up. Once confirmed, upload the files in `CARD_FILES` and attach the result to the `createPost` payload.
