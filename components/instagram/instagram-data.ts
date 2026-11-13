import { INSTAGRAM_AVATAR_OVERRIDES, INSTAGRAM_IDS, OWNER_AVATAR, PERSON_AVATARS } from '@/lib/template-config'
import type { PostComment } from './comments-sheet'
import { SION_DAY3_POST_ID } from './insta-comment-choices'
import type { FriendStory } from './friend-story-viewer'
import type { UserProfileData } from './user-profile'

/*
 * 인스타그램 콘텐츠 기본 템플릿.
 * 이미지는 public/ 아래에 넣고 경로만 바꾸면 됩니다. (예: /feed/a-1.jpg)
 * 등장인물 아이디는 lib/template-config.ts 의 INSTAGRAM_IDS 에서 고정 관리합니다.
 * 게시물 handle이 PROFILES 키와 같으면 게시물 상단 아이디를 눌러 프로필로 이동할 수 있습니다.
 */

export const PLACEHOLDER_IMAGE = '/placeholder.svg'
export const DEFAULT_AVATAR = '/images/default/instagram-default.png'

const { sion, riku, yushi, sakuya, ryo, daeyoung } = INSTAGRAM_IDS

const avatarOf = (person: { name: string }) =>
  INSTAGRAM_AVATAR_OVERRIDES[person.name] ?? PERSON_AVATARS[person.name] ?? DEFAULT_AVATAR

/** 여주(휴대폰 주인) 프로필 및 기본 스토리 */
export const MY_AVATAR = OWNER_AVATAR
export const MY_PROFILE = {
  followers: 315,
  following: 321,
  bio: '',
}
export const MY_STORY = {
  src: PLACEHOLDER_IMAGE,
  alt: '[내 스토리 이미지 설명을 입력하세요]',
  time: '방금',
  views: 10,
}

/** 내 스토리 '활동' 시트에 보이는 좋아요/조회한 사람 */
export const STORY_VIEWERS: { handle: string; name: string; src?: string; reply?: string }[] = [
  { handle: sion.id, name: sion.name, src: avatarOf(sion) },
  { handle: riku.id, name: riku.name, src: avatarOf(riku) },
  { handle: yushi.id, name: yushi.name, src: avatarOf(yushi) },
  { handle: sakuya.id, name: sakuya.name, src: avatarOf(sakuya) },
  { handle: ryo.id, name: ryo.name, src: avatarOf(ryo) },
  { handle: daeyoung.id, name: daeyoung.name, src: avatarOf(daeyoung) },
]

/** 댓글 작성자 프로필 사진 (없으면 DEFAULT_AVATAR) */
export const COMMENT_AVATARS: Record<string, string> = Object.fromEntries(
  Object.values(INSTAGRAM_IDS).map((person) => [person.id, avatarOf(person)]),
)

function profile(person: { id: string; name: string }, followers: number, following: number, bio: string): UserProfileData {
  // 일차 지정 게시물은 앱에서 isPostVisible 로 걸러 붙이므로 기본 격자에는 넣지 않음 (스포일러 방지)
  const posts = postsOf(person.id).filter((post) => !post.day)
  return {
    handle: person.id,
    name: person.name,
    bio,
    avatar: avatarOf(person),
    followers,
    following,
    tiles: tilesOf(posts),
  }
}

export function tilesOf(posts: Post[]): UserProfileData['tiles'] {
  return posts.map((post) => ({ src: post.images[0].src, alt: post.images[0].alt, multiple: post.images.length > 1 }))
}

function story(
  person: { id: string; name: string },
  time: string,
  extra: Partial<Pick<FriendStory, 'image' | 'images'>> = {},
): { handle: string; src: string; story: FriendStory } {
  return {
    handle: person.id,
    src: avatarOf(person),
    story: {
      handle: person.id,
      avatar: avatarOf(person),
      time,
      image: extra.image ?? extra.images?.[0] ?? { src: PLACEHOLDER_IMAGE, alt: `[${person.id} 스토리 이미지 설명]` },
      images: extra.images,
    },
  }
}

/**
 * afterWork: 그날 데이트(업무) 전환이 끝난 뒤에만 보이는 스토리
 * mentionOwner: 플레이어 아이디를 스토리에 멘션 (화면에서 입력한 아이디로 치환)
 */
export type StoryItem = { handle: string; src: string; story?: FriendStory; afterWork?: boolean; mentionOwner?: boolean }

/**
 * 날짜별 스토리. 스토리는 매일 초기화되며, 해당 날짜에 목록에 없는 사람은 스토리 링이 표시되지 않습니다.
 * 새 날짜의 스토리를 추가하려면 해당 일차 배열에 story(...) 를 넣으세요.
 */
export const STORIES_BY_DAY: Record<number, StoryItem[]> = {}

export function storiesForDay(day: number, workEnded = true): StoryItem[] {
  return (STORIES_BY_DAY[day] ?? []).filter((item) => !item.afterWork || workEnded)
}

/** 3일 차: 데이트 끝나고 시온이 올린 지하철 스토리 */
STORIES_BY_DAY[3] = [
  {
    ...story(sion, '방금', {
      images: [
        { src: '/stories/sion-day3-1.jpg', alt: '녹사평역 승강장 유리에 비친 시온의 거울 셀카, 손에 쇼핑백' },
        { src: '/stories/sion-day3-2.jpg', alt: '지하철 안에서 쇼핑백을 든 채 휴대폰을 보는 시온' },
      ],
    }),
    afterWork: true,
  },
  story(sakuya, '4시간', {
    image: { src: '/stories/sakuya-day3.png', alt: '회색 벽 앞에서 크림색 티셔츠를 입고 브이를 하는 사쿠야의 셀카' },
  }),
]

/** 5일 차: 점심에 대영이 여주를 태그해 올린 국밥집 스토리 (글씨 있는 사진이 먼저) */
export const DAEYOUNG_ID = daeyoung.id
export const DAEYOUNG_TAG_DAY = 5
STORIES_BY_DAY[DAEYOUNG_TAG_DAY] = [
  {
    ...story(daeyoung, '1시간', {
      images: [
        { src: '/stories/daeyoung-day5-1.jpg', alt: '국밥집 메뉴판 아래에서 검은 패딩 차림으로 숟가락을 문 채 정면을 보는 대영, "누나가 찍어줌" 문구' },
        { src: '/stories/daeyoung-day5-2.jpg', alt: '국밥집 메뉴판 아래에서 숟가락을 물고 옆을 보는 대영' },
      ],
    }),
    afterWork: true,
    mentionOwner: true,
  },
  story(sion, '3시간', {
    image: { src: '/stories/sion-day5.jpg', alt: '검은 카라 니트를 입고 휴대폰으로 얼굴을 가린 시온의 거울 셀카' },
  }),
  story(ryo, '5시간', {
    image: { src: '/stories/ryo-day5.jpg', alt: '밤거리에서 헤드폰을 목에 걸고 위에서 찍은 료의 흔들린 셀카' },
  }),
]

/** 4일 차: 유우시 스토리 태그를 허락하면 5초 뒤 올라오는 밀크티 스토리 (플레이어 아이디 멘션) */
export const YUSHI_ID = yushi.id

export function yushiTagStory(ownerHandle: string): StoryItem {
  const item = story(yushi, '방금', {
    image: { src: '/stories/yushi-day4-milktea.jpg', alt: '카페 대리석 테이블 위 꽃무늬 잔에 담긴 밀크티' },
  })
  return { ...item, story: { ...item.story, mention: ownerHandle } }
}

/** 1일차 기준 상대 시간("2시간 전", "1일 전", "1주")을 경과 일수만큼 뒤로 민 표기로 바꿉니다. */
export function shiftTime(time: string, elapsedDays: number): string {
  if (elapsedDays <= 0) return time
  const match = time.match(/(\d+)\s*(분|시간|일|주)/)
  const suffix = /전\s*$/.test(time) ? ' 전' : ''
  let days = elapsedDays
  if (match) {
    const n = Number(match[1])
    if (match[2] === '일') days = n + elapsedDays
    else if (match[2] === '주') days = n * 7 + elapsedDays
  }
  const label = days < 7 ? `${days}일` : `${Math.floor(days / 7)}주`
  return `${label}${suffix}`
}

/** 1일 차 스토리 */
export const STORIES: StoryItem[] = [
  story(sion, '2시간', {
    image: { src: '/stories/sion-day1.jpg', alt: '줄무늬 카라 셔츠를 입고 얼굴 반쪽만 찍은 시온의 셀카' },
  }),
  story(daeyoung, '3시간', {
    image: { src: '/stories/daeyoung-day1.jpg', alt: '검은 트레이닝복 세트를 입고 거울 셀카를 찍는 대영' },
  }),
  story(ryo, '5시간', {
    image: { src: '/stories/ryo-day1.jpg', alt: '호텔 방 침대 앞에서 흰 데님 재킷을 입고 놀란 표정으로 거울 셀카를 찍는 료' },
  }),
  story(riku, '7시간', {
    image: { src: '/stories/riku-day1.jpg', alt: '밤거리에서 상어 후드를 뒤집어쓰고 옆을 바라보는 리쿠' },
  }),
  story(yushi, '8시간', {
    image: { src: '/stories/yushi-day1.jpg', alt: '캠퍼스 길가에서 남색 과잠을 입고 책을 든 채 옆을 바라보는 유우시' },
  }),
]

STORIES_BY_DAY[1] = STORIES

/** 2일 차: 대영 스토리 */
STORIES_BY_DAY[2] = [
  story(daeyoung, '4시간', {
    image: { src: '/stories/daeyoung-day2.jpg', alt: '나무 그늘 아래 검은 나시 차림으로 앉아 옆을 보는 대영' },
  }),
  story(yushi, '6시간', {
    image: { src: '/stories/yushi-day2.png', alt: '현관 거울 앞에서 친구와 함께 팔을 들어 거울 셀카를 찍는 유우시' },
  }),
]

/** 3일 차: 리쿠 삼각김밥 스토리 */
STORIES_BY_DAY[3] = [
  story(riku, '2시간', {
    image: { src: '/stories/riku-day3.jpg', alt: '갈라진 회색 벽 앞에서 남색 과잠을 입고 삼각김밥을 든 채 옆을 보며 웃는 리쿠' },
  }),
]

/** 4일 차: 대학 강의실 옆자리에서 찍힌 대영 스토리 */
STORIES_BY_DAY[4] = [
  story(daeyoung, '2시간', {
    image: { src: '/stories/daeyoung-day4.jpg', alt: '강의실에서 안경을 쓰고 노트에 낙서하며 옆을 보는 대영' },
  }),
  story(sion, '2시간', {
    image: { src: '/stories/sion-day4.png', alt: '회색 재킷을 입고 복도 문 옆 벽에 기대 위에서 찍은 시온의 셀카' },
  }),
  story(riku, '3시간', {
    image: { src: '/stories/riku-day4.webp', alt: '청바지 무릎 위에서 손가락으로 집어 든 빨간 얼굴에 하늘색 몸통의 새 모양 인형 키링' },
  }),
  story(sakuya, '5시간', {
    image: { src: '/stories/sakuya-day4.png', alt: '거리에서 친구와 함께 흔들리게 찍힌 체크 셔츠 차림의 사쿠야' },
  }),
]

/** 6일 차: 시온 거울 셀카 스토리 */
STORIES_BY_DAY[6] = [
  story(sion, '2시간', {
    images: [
      { src: '/stories/sion-day6-1.png', alt: '검은 나시와 회색 청바지 차림으로 휴대폰 플래시를 켜고 얼굴을 가린 시온의 거울 셀카' },
      { src: '/stories/sion-day6-2.png', alt: '검은 나시와 회색 청바지 차림으로 손으로 앞머리를 넘기며 찍은 시온의 거울 셀카' },
    ],
  }),
]

export type Post = {
  id: string
  handle: string
  avatar: string
  time: string
  location?: string
  images: { src: string; alt: string }[]
  caption: string
  likes: number
  /** 좋아요 누른 사람 (첫 번째 아이디가 '○○님 외 N명'으로 노출) */
  likedBy?: string[]
  comments: PostComment[]
  commentsDisabled?: boolean
  /** 이 일차부터 피드에 노출 (없으면 항상 노출). time 은 이 일차 기준 */
  day?: number
  /** true 면 day 당일엔 데이트(업무) 전환이 끝난 뒤에 노출 */
  afterWork?: boolean
}

export function isPostVisible(post: Post, day: number, workEnded: boolean) {
  if (!post.day) return true
  if (day < post.day) return false
  return !(day === post.day && post.afterWork && !workEnded)
}

/** 여주 게시물 handle 토큰. 화면에서는 입력한 이름의 영문 아이디로 자동 치환됩니다. */
export const MY_HANDLE = 'me'
/** 홈 피드에 노출되는 여주 게시물 id */
export const MY_POST_ID = 'my-post'

/** 여주 프로필 피드 게시물 (최신순) */
export const MY_POSTS: Post[] = []

/** 홈 타임라인에 노출되는 피드 게시물 템플릿 */
export const POSTS: Post[] = [
  {
    id: SION_DAY3_POST_ID,
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '방금 전',
    location: '용산',
    images: [
      { src: '/posts/sion-day3-1.jpg', alt: '용산에서 찍은 시온 사진 1' },
      { src: '/posts/sion-day3-2.jpg', alt: '용산에서 찍은 시온 사진 2' },
      { src: '/posts/sion-day3-3.jpg', alt: '용산에서 찍은 시온 사진 3' },
      { src: '/posts/sion-day3-4.jpg', alt: '용산에서 찍은 시온 사진 4' },
      { src: '/posts/sion-day3-5.jpg', alt: '용산에서 찍은 시온 사진 5' },
      { src: '/posts/sion-day3-6.jpg', alt: '용산에서 찍은 시온 사진 6' },
      { src: '/posts/sion-day3-7.jpg', alt: '용산에서 찍은 시온 사진 7' },
    ],
    caption: '날씨 좋은 날 🍃',
    likes: 442,
    likedBy: [riku.id, daeyoung.id],
    comments: [],
    day: 3,
    afterWork: true,
  },
  {
    id: 'daeyoung-saturday-movie-post',
    handle: daeyoung.id,
    avatar: avatarOf(daeyoung),
    time: '방금 전',
    location: '메가박스 소원대점',
    images: [
      { src: '/posts/daeyoung-movie-1.jpg', alt: '영화관 에스컬레이터 앞에서 음료 빨대를 물고 팝콘을 든 대영' },
      { src: '/posts/daeyoung-movie-2.jpg', alt: '음료와 팝콘을 들고 정면을 바라보는 안경 쓴 대영' },
      { src: '/posts/daeyoung-movie-3.jpg', alt: '빈 팝콘 통을 머리에 얹고 장난스럽게 웃는 대영' },
    ],
    caption: 'photo by 사쿠 ㅎㅎ',
    likes: 301,
    likedBy: [sakuya.id, ryo.id],
    comments: [{ name: sakuya.id, text: '오~ 훈남', time: '방금', likes: 1 }],
    day: 3,
    afterWork: true,
  },
  {
    id: 'daeyoung-friday-post',
    handle: daeyoung.id,
    avatar: avatarOf(daeyoung),
    time: '3시간 전',
    images: [
      { src: '/posts/daeyoung-1.jpg', alt: '라운지에서 전화하며 아이패드를 보는 대영, 앞에 흰 노트북' },
      { src: '/posts/daeyoung-2.jpg', alt: '맥북 뒤에서 정면을 보는 대영, 민트색 커피컵과 프로틴 음료' },
      { src: '/posts/daeyoung-3.jpg', alt: '빈백에 기대 앉아 휴대폰을 들고 웃는 대영' },
      { src: '/posts/daeyoung-4.jpg', alt: '아이패드로 영상통화하며 손을 흔드는 대영의 뒷모습' },
    ],
    caption: '다음 학기에는 금공강 하자 제발...',
    likes: 276,
    likedBy: [sion.id, riku.id],
    comments: [],
  },
  {
    id: 'ryo-post',
    handle: ryo.id,
    avatar: avatarOf(ryo),
    time: '2일 전',
    images: [
      { src: '/posts/ryo-1.jpg', alt: '파란 후드를 뒤집어쓰고 거울 셀카를 찍는 료' },
      { src: '/posts/ryo-2.jpg', alt: '엘리베이터 안에서 캐리어를 잡고 몸을 숙여 웃는 료' },
    ],
    caption: '',
    likes: 318,
    likedBy: [sakuya.id, yushi.id],
    comments: [],
  },
  {
    id: 'yushi-weather-post',
    handle: yushi.id,
    avatar: avatarOf(yushi),
    time: '3일 전',
    images: [
      { src: '/posts/yushi-feed-1.jpg', alt: '잔디밭에서 검은 재킷을 여미며 카메라를 바라보는 유우시' },
      { src: '/posts/yushi-feed-2.jpg', alt: '잔디밭에서 검은 재킷 차림으로 옆을 바라보는 유우시' },
    ],
  caption: '날씨 조타~~~',
  likes: 213,
    likedBy: [sakuya.id, ryo.id],
    comments: [],
  },
  {
    id: 'sion-boat-post',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '4일 전',
    images: [
      { src: '/posts/sion-feed-boat.jpg', alt: '선글라스를 머리에 얹고 보트 위에서 셀카를 찍는 시온, 뒤로 노을빛 물결' },
    ],
    caption: 'ㅎㅎ',
    likes: 503,
    likedBy: [riku.id, yushi.id],
    comments: [],
  },
]

/** 홈 타임라인에는 뜨지 않고 프로필 피드에만 보이는 게시물 템플릿 (최신순) */
export const PROFILE_ONLY_POSTS: Post[] = [
  {
    id: 'riku-piano-post',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '2일 전',
    images: [{ src: '/posts/riku-piano.png', alt: '연습실 피아노 앞 바닥에 앉아 휴대폰을 보는 리쿠' }],
    caption: '',
    likes: 1032,
    likedBy: [sion.id, sakuya.id],
    comments: [],
  },
  {
    id: 'riku-vintage-post',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '5일 전',
    images: [{ src: '/posts/riku-vintage.png', alt: '빈티지 숍 계단 앞에서 안경과 이어폰을 끼고 회색 재킷을 여미는 리쿠' }],
    caption: '',
    likes: 987,
    likedBy: [yushi.id, ryo.id],
    comments: [],
  },
  {
    id: 'riku-harbor-post',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '1주 전',
    images: [{ src: '/posts/riku-harbor.jpg', alt: '항구 앞에 앉아 아이스 아메리카노를 빨대로 마시는 리쿠' }],
    caption: '',
    likes: 1104,
    likedBy: [sion.id, daeyoung.id],
    comments: [],
  },
  {
    id: 'sion-coffee-post',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '3주 전',
    images: [{ src: '/posts/sion-coffee.png', alt: '도심 거리에서 검은 민소매 차림으로 커피를 마시는 금발의 시온' }],
    caption: '',
    likes: 876,
    likedBy: [riku.id, daeyoung.id],
    comments: [],
  },
  {
    id: 'sakuya-bench-post',
    handle: sakuya.id,
    avatar: avatarOf(sakuya),
    time: '3일 전',
    images: [
      { src: '/posts/sakuya-feed-bench.jpg', alt: '노을 지는 산책로 벤치에 기대 앉아 뒤돌아보는 사쿠야' },
    ],
    caption: '',
    likes: 412,
    likedBy: [ryo.id, yushi.id],
    comments: [],
  },
  {
    id: 'sakuya-gelato-post',
    handle: sakuya.id,
    avatar: avatarOf(sakuya),
    time: '1주 전',
    images: [
      { src: '/posts/sakuya-feed-gelato.jpg', alt: '가로수 길에서 젤라또를 먹는 분홍 티셔츠의 사쿠야' },
    ],
    caption: '',
    likes: 389,
    likedBy: [riku.id, sion.id],
    comments: [],
  },
]

export const ALL_POSTS: Post[] = [...MY_POSTS, ...POSTS, ...PROFILE_ONLY_POSTS]

/** 프로필 피드에 노출되는 해당 계정의 실제 게시물 (최신순) */
const HOURS_PER_UNIT: Record<string, number> = { 분: 1 / 60, 시간: 1, 일: 24, 주: 24 * 7 }

function hoursAgo(time: string): number {
  const match = time.match(/(\d+)\s*(분|시간|일|주)/)
  return match ? Number(match[1]) * HOURS_PER_UNIT[match[2]] : 0
}

export function postsOf(handle: string): Post[] {
  return [...POSTS, ...PROFILE_ONLY_POSTS]
    .filter((post) => post.handle === handle)
    .sort((a, b) => hoursAgo(a.time) - hoursAgo(b.time))
}

export const PROFILES: Record<string, UserProfileData> = {
  [sion.id]: profile(sion, 3189, 298, ''),
  [riku.id]: profile(riku, 1203, 341, ''),
  [yushi.id]: profile(yushi, 121, 121, ''),
  [sakuya.id]: profile(sakuya, 730, 388, ''),
  [ryo.id]: profile(ryo, 521, 476, ''),
  [daeyoung.id]: profile(daeyoung, 389, 412, ''),
}

/**
 * 사파리를 처음 열면 뜨는 인스타그램 알림.
 * 알림을 누르면 postId 게시물이 열리고 comment가 댓글에 추가됩니다. 사용하지 않으려면 null.
 */
export const NOTIFICATION_COMMENT: { postId: string; comment: PostComment } | null = null
