// Generates a 10-card text structure + caption for every topic in topics.json.
// Output: cards-data.json (array of { topic, cards: [...] }), used by render-all.js
const fs = require('fs');
const path = require('path');

const topics = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf-8'));

const ACCENTS = ['#FF5C8A', '#FF8A5C', '#FFC15C', '#5CC2FF', '#5CFFB8', '#C15CFF', '#FFE15C', '#FF7A7A', '#5C8AFF', '#FF5C5C'];

const SLOT_LABELS = [
  'HOOK', '숫자로 보기', '핵심 포인트', '실전 사례', '비교해보기',
  '주의할 점', '현지화 팁', '체크리스트', '요약', 'CTA',
];

function buildCards(topic) {
  const t = topic.title;
  const cat = topic.category;
  const lines = [
    { title: t, body: `${cat} 분야, 지금 알아야 할 이야기.\n끝까지 보면 정리됩니다.` },
    { title: `${t}\n핵심 숫자부터 본다`, body: `숫자 하나가 방향을 바꾼다.\n감이 아니라 데이터로 판단하자.` },
    { title: `${t}\n가장 중요한 포인트`, body: `모든 걸 다 알 필요는 없다.\n이 포인트 하나만 기억하자.` },
    { title: `${t}\n실제 현장에서는`, body: `이론과 현장은 다르다.\n현지에서 겪는 진짜 차이가 있다.` },
    { title: `${t}\n한국과 비교하면`, body: `같은 제품도 시장이 다르면\n전략이 달라져야 한다.` },
    { title: `${t}\n이것만은 조심하자`, body: `모르고 진행하면 손해로 이어진다.\n미리 알면 막을 수 있다.` },
    { title: `${t}\n현지화 한 줄 팁`, body: `번역이 아니라 현지화가 필요하다.\n현지 시선으로 다시 봐야 한다.` },
    { title: `${t}\n진출 전 체크리스트`, body: `준비 없는 진출은 비용으로 남는다.\n하나씩 점검하고 가자.` },
    { title: `${t}\n오늘의 요약`, body: `결국 중요한 건 실행이다.\n아는 것과 하는 것은 다르다.` },
    { title: `${t}\n여러분의 생각은?`, body: `댓글로 의견을 남겨주세요.\n저장하고 다음 글도 확인하세요.` },
  ];

  return lines.map((l, i) => ({
    tag: `${String(i + 1).padStart(2, '0')} · ${SLOT_LABELS[i]}`,
    title_ko: l.title,
    body_ko: l.body,
    accent: ACCENTS[i],
  }));
}

function buildCaption(topic) {
  return `${topic.title}

동남아 뷰티 비즈니스, 알면 다르게 보입니다.
오늘은 [${topic.category}] 관련 이야기를 카드로 정리했어요.

여러분의 생각은 어떠세요? 댓글로 알려주세요.
저장해두고 진출 전에 다시 확인하세요!

#K뷰티 #동남아진출 #뷰티비즈니스 #${topic.category.replace(/\s/g, '')} #뷰티스타트업`;
}

const data = topics.map((topic) => ({
  id: topic.id,
  category: topic.category,
  title: topic.title,
  caption: buildCaption(topic),
  cards: buildCards(topic),
}));

fs.writeFileSync(path.join(__dirname, 'cards-data.json'), JSON.stringify(data, null, 2));
console.log(`Generated card data for ${data.length} topics -> cards-data.json`);
