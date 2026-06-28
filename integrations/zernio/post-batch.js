// Drip-feeds a series of posts onto a profile's queue, one slot each, in order.
// Usage: node post-batch.js posts.json
// posts.json: [{ "content": "...", "mediaPaths": ["abs/or/relative/path.png", ...] }, ...]
const fs = require('fs');
const path = require('path');
const zernio = require('./client');

async function uploadOne(filePath) {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';

  const { data } = await zernio.media.getMediaPresignedUrl({
    body: { filename, contentType },
  });
  const { uploadUrl, publicUrl } = data;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: fs.readFileSync(filePath),
  });
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${res.status} ${await res.text()}`);
  return publicUrl;
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node post-batch.js <posts.json>');
    process.exit(1);
  }

  const profileId = process.env.ZERNIO_PROFILE_ID;
  const queueId = process.env.ZERNIO_QUEUE_ID; // optional
  if (!profileId) throw new Error('Set ZERNIO_PROFILE_ID in .env first.');

  const igAccountId = process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID;
  const threadsAccountId = process.env.ZERNIO_THREADS_ACCOUNT_ID;
  const platforms = [];
  if (igAccountId) platforms.push({ platform: 'instagram', accountId: igAccountId });
  if (threadsAccountId) platforms.push({ platform: 'threads', accountId: threadsAccountId });

  const posts = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  for (const [i, p] of posts.entries()) {
    const mediaItems = [];
    for (const mediaPath of p.mediaPaths || []) {
      const publicUrl = await uploadOne(path.resolve(mediaPath));
      mediaItems.push({ url: publicUrl, type: 'image' });
    }

    const { post } = await zernio.posts.createPost({
      content: p.content,
      mediaItems,
      platforms,
      queuedFromProfile: profileId,
      ...(queueId ? { queueId } : {}),
    });

    console.log(`[${i + 1}/${posts.length}] queued -> ${post.scheduledFor} (${post._id})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
