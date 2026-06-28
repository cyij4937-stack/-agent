// Schedules the 100-topic K-beauty SEA series at fixed daily times:
// 10:00 / 15:00 / 21:00 (Asia/Seoul), 5 different-topic posts per slot, in order.
// Usage: node post-series.js [--from-id N] [--start-date YYYY-MM-DD] [--dry-run]
const fs = require('fs');
const path = require('path');
const zernio = require('./client');

const SERIES_DIR = path.join(__dirname, '..', '..', 'content', 'kbeauty-sea-series');
const data = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, 'cards-data.json'), 'utf-8'));

const SLOT_HOURS = [10, 15, 21]; // 10am / 3pm / 9pm, Asia/Seoul
const POSTS_PER_SLOT = 5;
const TIMEZONE = 'Asia/Seoul';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const idx = args.indexOf(flag);
    return idx === -1 ? null : args[idx + 1];
  };
  return {
    fromId: parseInt(get('--from-id') || '1', 10),
    startDate: get('--start-date') || new Date().toISOString().slice(0, 10),
    dryRun: args.includes('--dry-run'),
  };
}

// Builds a wall-clock ISO string (no Z) for the given date+hour; Zernio applies `timezone` separately.
function scheduledForLocal(dateStr, hour) {
  return `${dateStr}T${String(hour).padStart(2, '0')}:00:00`;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function uploadOne(filePath) {
  const filename = path.basename(filePath);
  const { data: presign } = await zernio.media.getMediaPresignedUrl({
    body: { filename, contentType: 'image/png' },
  });
  const res = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: fs.readFileSync(filePath),
  });
  if (!res.ok) throw new Error(`Upload failed for ${filename}: ${res.status} ${await res.text()}`);
  return presign.publicUrl;
}

async function main() {
  const { fromId, startDate, dryRun } = parseArgs();

  const igAccountId = process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID;
  const threadsAccountId = process.env.ZERNIO_THREADS_ACCOUNT_ID;
  const platforms = [];
  if (igAccountId) platforms.push({ platform: 'instagram', accountId: igAccountId });
  if (threadsAccountId) platforms.push({ platform: 'threads', accountId: threadsAccountId });
  if (!platforms.length && !dryRun) {
    throw new Error('Set ZERNIO_INSTAGRAM_ACCOUNT_ID and/or ZERNIO_THREADS_ACCOUNT_ID in .env.');
  }

  const topics = data.filter((t) => t.id >= fromId);

  let dayOffset = 0;
  let slotIndex = 0;
  let inSlotCount = 0;

  for (const topic of topics) {
    const dateStr = addDays(startDate, dayOffset);
    const hour = SLOT_HOURS[slotIndex];
    const scheduledFor = scheduledForLocal(dateStr, hour);

    console.log(`[topic ${topic.id}] "${topic.title}" -> ${scheduledFor} ${TIMEZONE}`);

    if (!dryRun) {
      const cardsDir = path.join(SERIES_DIR, `topic-${String(topic.id).padStart(3, '0')}`, 'cards');
      const cardFiles = fs.readdirSync(cardsDir).sort().map((f) => path.join(cardsDir, f));

      const mediaItems = [];
      for (const f of cardFiles) {
        mediaItems.push({ url: await uploadOne(f), type: 'image' });
      }

      const { post } = await zernio.posts.createPost({
        content: topic.caption,
        mediaItems,
        platforms,
        scheduledFor,
        timezone: TIMEZONE,
      });
      console.log(`  -> post ${post._id} scheduled for ${post.scheduledFor}`);
    }

    inSlotCount += 1;
    if (inSlotCount >= POSTS_PER_SLOT) {
      inSlotCount = 0;
      slotIndex += 1;
      if (slotIndex >= SLOT_HOURS.length) {
        slotIndex = 0;
        dayOffset += 1;
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
