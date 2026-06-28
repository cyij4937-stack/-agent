# K-뷰티 동남아 100개 주제 시리즈

- `topics.json` — 100개 주제 (10개 카테고리: 시장 개관, 베트남, 태국, 인도네시아, 필리핀, 말레이시아, 싱가포르, 유통 채널, 마케팅, 제품 전략, 규제, 실패와 교훈, 성공 사례, 물류, 데이터, 투자/자금, 팀/조직, 미래 트렌드, 총정리)
- `generate-content.js` — `topics.json`을 읽어 주제별 10장 카드 텍스트 + 캡션을 생성 → `cards-data.json`
- `render-all.js` — `cards-data.json`을 읽어 `topic-001/cards/card_01.png` ~ `topic-100/cards/card_10.png` (1080×1350) 렌더링
- `topic-XXX/cards/` — 실제 카드 이미지 (주제당 10장)

## ⚠️ 중요: 콘텐츠 검증 필요

`generate-content.js`는 100개 주제를 빠르게 시리즈화하기 위한 **템플릿 기반 자동 생성기**입니다. 각 카드의 통계·사례·규정 문구는 실제 데이터가 아니라 자리표시 문장(placeholder)입니다. **게시 전에 반드시 실제 숫자/사례/규정으로 교체**하세요. 특히:
- 통계(인구, 성장률 등)는 실제 출처로 교체
- 국가별 규정(BPOM, FDA, CFS 등)은 최신 공식 자료로 확인
- 사례는 실제 브랜드 사례로 교체하거나 일반화된 표현으로 유지

`cards-data.json`을 직접 수정한 뒤 `node render-all.js`를 다시 실행하면 이미지가 갱신됩니다.

## 발행 스케줄

`integrations/zernio/post-series.js`가 다음 규칙으로 자동 예약합니다:
- 매일 10:00 / 15:00 / 21:00 (Asia/Seoul), 시간대당 5개 주제(서로 다른 카드뉴스)
- 100개 주제를 순서대로 소진 → 하루 15개(5×3슬롯) 기준 총 7일 분량 (7일째는 10개만 채워지고 21시 슬롯은 비어 있음)

```bash
cd integrations/zernio
npm run post-series -- --dry-run                  # 스케줄 미리보기 (업로드/발행 없음)
npm run post-series -- --start-date 2026-07-01     # 실제 업로드 + 예약 시작
npm run post-series -- --from-id 16                # 16번 주제부터 이어서 진행
```
