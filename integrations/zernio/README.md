# Zernio Integration

Publishes the K-beauty SEA card news (`content/kbeauty-sea-cardnews/cards/`) to Instagram and Threads via the [Zernio API](https://docs.zernio.com/).

## Setup

```bash
cp .env.example .env   # fill in ZERNIO_API_KEY — never commit this file
npm install
```

## Connect Instagram and Threads accounts

Account connection is OAuth-based and must be done once in a browser (not scriptable end-to-end). Instagram and Threads use the plain OAuth flow — no secondary page/org picker step (unlike Facebook, LinkedIn, Pinterest, Google Business, Snapchat).

1. Set `ZERNIO_PROFILE_ID` in `.env` (create one first via `zernio.profiles.createProfile` if you don't have one).
2. Run:

```bash
npm run connect -- instagram
npm run connect -- threads
```

3. Open the printed URL in a browser and authorize each account.

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
