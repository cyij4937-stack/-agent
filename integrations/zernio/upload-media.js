const fs = require('fs');
const path = require('path');
const zernio = require('./client');

const CARDS_DIR = path.join(__dirname, '..', '..', 'content', 'kbeauty-sea-cardnews', 'cards');
const CARD_FILES = Array.from({ length: 10 }, (_, i) =>
  path.join(CARDS_DIR, `card_${String(i + 1).padStart(2, '0')}.png`)
);

async function uploadFile(filePath) {
  const filename = path.basename(filePath);
  const { data } = await zernio.media.getMediaPresignedUrl({
    body: { filename, contentType: 'image/png' },
  });
  const { uploadUrl, publicUrl } = data;

  const fileBuffer = fs.readFileSync(filePath);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: fileBuffer,
  });
  if (!res.ok) {
    throw new Error(`Upload failed for ${filename}: ${res.status} ${await res.text()}`);
  }

  return publicUrl;
}

async function uploadCardImages() {
  const mediaItems = [];
  for (const filePath of CARD_FILES) {
    const publicUrl = await uploadFile(filePath);
    console.log(`Uploaded ${path.basename(filePath)} -> ${publicUrl}`);
    mediaItems.push({ url: publicUrl, type: 'image' });
  }
  return mediaItems;
}

module.exports = { uploadCardImages, CARD_FILES };
