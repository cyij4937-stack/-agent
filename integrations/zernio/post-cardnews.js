const zernio = require('./client');
const { uploadCardImages } = require('./upload-media');

const CAPTION = `동남아 뷰티 시장, 매년 10%씩 큰다.

베트남 한 매장에서 한국 크림이 입고 하루 만에 품절됐어요.
인구 6억 8천만, 평균 나이 29살. 가장 어린 시장이 가장 빠르게 소비합니다.

Shopee, 틱톡샵 라이브가 진짜 매출을 만들고, 베트남은 가격, 태국은 미백, 인도네시아는 할랄 인증이 핵심 키입니다.
허가 없이 들어갔다 전량 반품된 사례도 있어요. 준비 없는 진출은 결국 재고로 남습니다.

여러분은 어느 나라가 가장 유망하다고 보세요? 댓글로 알려주세요.

#K뷰티 #동남아진출 #뷰티비즈니스 #베트남뷰티 #태국뷰티 #인도네시아뷰티 #이커머스 #화장품수출`;

async function main() {
  const igAccountId = process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID;
  const threadsAccountId = process.env.ZERNIO_THREADS_ACCOUNT_ID;

  if (!igAccountId && !threadsAccountId) {
    throw new Error(
      'Set ZERNIO_INSTAGRAM_ACCOUNT_ID and/or ZERNIO_THREADS_ACCOUNT_ID in .env. Run `npm run list-accounts` to find them.'
    );
  }

  console.log('Uploading 10 card images to Zernio media storage...');
  const mediaItems = await uploadCardImages();
  // Uploads land in temp storage (expires in 7 days); publish soon after running this.

  const platforms = [];
  if (igAccountId) platforms.push({ platform: 'instagram', accountId: igAccountId });
  if (threadsAccountId) platforms.push({ platform: 'threads', accountId: threadsAccountId });

  const profileId = process.env.ZERNIO_PROFILE_ID;
  const queueId = process.env.ZERNIO_QUEUE_ID; // optional, targets a specific queue
  const useQueue = process.env.ZERNIO_USE_QUEUE === 'true';

  const scheduling = useQueue
    ? { queuedFromProfile: profileId, ...(queueId ? { queueId } : {}) }
    : {};
  // publishNow: true, // uncomment to publish immediately instead of drafting/queueing

  if (useQueue && !profileId) {
    throw new Error('ZERNIO_USE_QUEUE=true requires ZERNIO_PROFILE_ID in .env.');
  }

  const { data } = await zernio.posts.createPost({
    body: {
      content: CAPTION,
      mediaItems,
      platforms,
      ...scheduling,
    },
  });
  const { post } = data;

  console.log('Post created:', post._id);
  if (post.scheduledFor) console.log('Scheduled for:', post.scheduledFor);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
