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

This uploads all 10 cards in `content/kbeauty-sea-cardnews/cards/` via Zernio's presigned-upload flow, then creates a post with those images attached. 10 images fits exactly within Instagram's carousel limit (10) and Threads' image limit (10).

By default this creates a draft post (no `publishNow`/`scheduledFor`). Uncomment `publishNow: true` in `post-cardnews.js` to publish immediately, or add `scheduledFor`/`timezone` to schedule it.

Note: uploaded media lives in temporary storage for 7 days until a post referencing it actually publishes — don't leave a draft sitting unpublished for too long, or re-run `post-cardnews` to re-upload.

### Queue scheduling (drip-feed)

Set `ZERNIO_USE_QUEUE=true` in `.env` (and `ZERNIO_PROFILE_ID`, plus optionally `ZERNIO_QUEUE_ID` to target a non-default queue) to have `post-cardnews` land on the profile's next free recurring slot instead of being created as an unscheduled draft.

To drip-feed a whole series of posts (e.g. the country-by-country follow-ups), use `post-batch`:

```bash
npm run post-batch -- posts.json
```

`posts.json` format:

```json
[
  { "content": "Post 1 text", "mediaPaths": ["../../content/.../card_01.png"] },
  { "content": "Post 2 text", "mediaPaths": [] }
]
```

Each entry is created with `queuedFromProfile`, so Zernio assigns it the next available slot in order — never compute `scheduledFor` yourself from `/v1/queue/next-slot`, since that bypasses queue locking and can double-book a slot.
