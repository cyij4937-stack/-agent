const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards-data.json'), 'utf-8'));

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function template(c, page, total) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  html, * { margin:0; padding:0; box-sizing:border-box; }
  html { background:#0F0F14; }
  body {
    width: 1080px; height: 1350px;
    font-family: -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif;
    background-color: #0F0F14;
    background-image: linear-gradient(160deg, #0F0F14 0%, #1A1A22 60%, ${c.accent}33 100%);
    color: #FFFFFF; position: relative; overflow: hidden;
  }
  .glow { position:absolute; width:700px; height:700px; border-radius:50%; background:${c.accent}; opacity:0.18; top:-250px; right:-250px; filter: blur(10px); }
  .frame { position: relative; height: 100%; padding: 90px 80px; display:flex; flex-direction:column; justify-content:center; }
  .tag { display:inline-block; align-self:flex-start; font-size:28px; font-weight:700; letter-spacing:2px; color:${c.accent}; border:2px solid ${c.accent}; border-radius:40px; padding:10px 28px; margin-bottom:50px; }
  .title-ko { font-size:66px; font-weight:800; line-height:1.32; margin-bottom:40px; white-space:pre-line; }
  .divider { width:80px; height:6px; background:${c.accent}; border-radius:4px; margin-bottom:50px; }
  .body-ko { font-size:38px; line-height:1.65; font-weight:500; white-space:pre-line; }
  .footer { position:absolute; bottom:60px; left:80px; right:80px; display:flex; justify-content:space-between; font-size:24px; color:#6A6A76; font-weight:600; letter-spacing:1px; }
</style></head>
<body>
  <div class="glow"></div>
  <div class="frame">
    <div class="tag">${esc(c.tag)}</div>
    <div class="title-ko">${esc(c.title_ko)}</div>
    <div class="divider"></div>
    <div class="body-ko">${esc(c.body_ko)}</div>
  </div>
  <div class="footer"><span>K-BEAUTY × SEA</span><span>${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}</span></div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });

  for (const topic of data) {
    const outDir = path.join(__dirname, `topic-${String(topic.id).padStart(3, '0')}`, 'cards');
    fs.mkdirSync(outDir, { recursive: true });
    const total = topic.cards.length;
    for (let i = 0; i < topic.cards.length; i++) {
      const html = template(topic.cards[i], i + 1, total);
      await page.setContent(html);
      const outPath = path.join(outDir, `card_${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: outPath });
    }
    console.log(`Rendered topic ${topic.id}: ${topic.title}`);
  }

  await browser.close();
})();
