import { INSTAGRAM_IDS, PERSON_AVATARS } from '@/lib/template-config'
import type { PostComment } from './comments-sheet'
import type { FriendStory } from './friend-story-viewer'
import type { UserProfileData } from './user-profile'

/*
 * 인스타그램 콘텐츠.
 * 이미지는 public/ 아래에 넣고 경로만 바꾸면 됩니다. (예: /feed/a-1.jpg)
 * 등장인물 아이디는 lib/template-config.ts 의 INSTAGRAM_IDS 에서 고정 관리합니다.
 * 게시물 handle이 PROFILES 키와 같으면 게시물 상단 아이디를 눌러 프로필로 이동할 수 있습니다.
 */

export const PLACEHOLDER_IMAGE = '/placeholder.svg'
export const DEFAULT_AVATAR = '/images/default/instagram-default.png'

const { sion, riku, yushi, sakuya, ryo, daeyoung } = INSTAGRAM_IDS

const avatarOf = (person: { name: string }) => PERSON_AVATARS[person.name] ?? DEFAULT_AVATAR

/** 여주(휴대폰 주인) */
export const MY_AVATAR = '/avatars/yeoju-instagram.jpg'
export const MY_PROFILE = {
  followers: 453,
  following: 487,
  bio: '',
}
export const MY_STORY = {
  src: '/stories/my-ramen.jpg',
  alt: '테이블 위에 놓인 시오 라멘과 쇼유 라멘 두 그릇',
  time: '방금',
  views: 100,
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
  const posts = postsOf(person.id)
  return {
    handle: person.id,
    name: person.name,
    bio,
    avatar: avatarOf(person),
    followers,
    following,
    tiles: posts.map((post) => ({ src: post.images[0].src, alt: post.images[0].alt, multiple: post.images.length > 1 })),
  }
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

export type StoryItem = { handle: string; src: string; story?: FriendStory }

/**
 * 날짜별 스토리. 스토리는 매일 초기화되며, 해당 날짜에 목록에 없는 사람은 스토리 링이 표시되지 않습니다.
 * 새 날짜의 스토리를 추가하려면 해당 일차 배열에 story(...) 를 넣으세요.
 */
export const STORIES_BY_DAY: Record<number, StoryItem[]> = {}

export function storiesForDay(day: number): StoryItem[] {
  return STORIES_BY_DAY[day] ?? []
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

export const STORIES: StoryItem[] = [
  story(sakuya, '5시간', {
   image: { src: '/stories/sakuya-selfie.jpg', alt: '흰 벽 앞에서 찍은 밝은 금발의 사쿠야 셀카' },
 }),
  story(daeyoung, '6시간', {
    images: [
      { src: '/stories/daeyoung-cat-1.jpg', alt: '햇살 비치는 나무 데크 위에 누워 있는 턱시도 고양이' },
      { src: '/stories/daeyoung-cat-2.jpg', alt: '나무 난간 아래 데크에 나란히 누워 있는 삼색 고양이 두 마리' },
    ],
  }),
]

STORIES_BY_DAY[1] = STORIES

STORIES_BY_DAY[2] = [
  story(sion, '1시간', {
    images: [
      { src: '/stories/sion-day2.jpg', alt: '나무 문 앞 거울 앞에서 휴대폰으로 얼굴을 가린 채 찍은 시온의 거울 셀카' },
      { src: '/stories/sion-day2-car.jpg', alt: '차 안 선바이저 거울에 비친, 보라색 휴대폰으로 얼굴을 반쯤 가린 시온의 셀카' },
    ],
  }),
]

STORIES_BY_DAY[5] = [
  story(daeyoung, '2시간', {
    image: { src: '/stories/daeyoung-day5.jpg', alt: '검은 트랙 수트를 입고 흰 문 앞 거울에서 찍은 대영의 거울 셀카' },
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
}

/** 여주 게시물 handle 토큰. 화면에서는 입력한 이름의 영문 아이디로 자동 치환됩니다. */
export const MY_HANDLE = 'me'
/** 홈 피드에 노출되는 여주 게시물 id */
export const MY_POST_ID = 'my-post'

/** 여주 프로필 피드 게시물 (최신순) */
export const MY_POSTS: Post[] = []

export const POSTS: Post[] = [
  {
    id: 'sakuya-gelato',
    handle: sakuya.id,
    avatar: avatarOf(sakuya),
    time: '2시간 전',
    images: [{ src: '/posts/sakuya-gelato.jpg', alt: '가로수길에서 젤라또를 먹는 사쿠야' }],
    caption: '젤라또 냠',
    likes: 124,
    likedBy: [sion.id, yushi.id, riku.id],
    comments: [
      { name: yushi.id, text: '혼자 먹냐', time: '1시간', likes: 3 },
      { name: 'hana.dayo', text: '귀여워ㅠㅠ 무슨 맛이에요?', time: '1시간', likes: 1 },
      { name: 'yuna_film', text: '색감 너무 좋다', time: '48분', likes: 0 },
    ],
  },
  {
    id: 'daeyoung-roses',
    handle: daeyoung.id,
    avatar: avatarOf(daeyoung),
    time: '2시간 전',
    images: [{ src: '/posts/daeyoung-roses.jpg', alt: '장미 백송이 꽃다발을 안고 웃는 김대영' }],
    caption: '장미 백송이',
    likes: 219,
    likedBy: [sion.id, ryo.id, sakuya.id],
    comments: [
      { name: MY_HANDLE, mine: true, text: '다이아 목걸이나 반지는?', time: '1시간', likes: 6 },
      { name: sion.id, text: 'ㅋㅋㅋㅋ 뭐야', time: '1시간', likes: 3 },
      { name: 'seoyeon.k_', text: '누가 받는 거예요ㅠㅠ 부럽다', time: '45분', likes: 1 },
      { name: 'flower_jin', text: '꽃다발 진짜 예쁘다', time: '20분', likes: 0 },
    ],
  },
  {
    id: 'yushi-summer',
    handle: yushi.id,
    avatar: avatarOf(yushi),
    time: '3시간 전',
    images: [
      { src: '/posts/yushi-summer-1.jpg', alt: '풀숲과 데이지 옆에 누워 위를 올려다보는 유우시' },
      { src: '/posts/yushi-summer-2.jpg', alt: '노을 진 하늘 아래 옆을 보며 미소 짓는 유우시' },
      { src: '/posts/yushi-summer-3.jpg', alt: '노을빛을 받으며 정면을 보고 웃는 유우시' },
      { src: '/posts/yushi-summer-4.jpg', alt: '가로등 옆 길가에 앉아 찍은 유우시의 셀카 두 장' },
    ],
    caption: '이제 여름 끝 ?',
    likes: 412,
    likedBy: [sakuya.id, riku.id, ryo.id],
    comments: [],
  },
  {
    id: 'b-post',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '3시간 전',
    images: [{ src: '/posts/riku-hoodie.jpg', alt: '밤거리에서 샤크 후드를 쓰고 팔을 뻗은 리쿠' }],
    caption: '',
    likes: 283,
    likedBy: [sakuya.id, ryo.id],
    comments: [],
    commentsDisabled: true,
  },
  {
    id: 'a-post',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '2주 전',
    location: 'Tower Bridge, London',
    images: [
      { src: '/posts/sion-london-1.jpg', alt: '야경 속 타워브릿지를 배경으로 강가에 서 있는 오시온' },
      { src: '/posts/sion-london-2.jpg', alt: '강가 난간에 기대 야경 속 타워브릿지를 바라보는 오시온' },
    ],
    caption: '런던 또 가고 싶네',
    likes: 331,
    likedBy: [yushi.id, sakuya.id, ryo.id],
    comments: [
      { name: MY_HANDLE, mine: true, text: '영국 사람들 진짜 우산 안 써?', time: '2주', likes: 4 },
      { name: 'minji_0412', text: '분위기 미쳤다 진짜', time: '2주', likes: 2 },
      { name: 'travel.haneul', text: '야경 너무 예뻐요 사진 맛집', time: '2주', likes: 1 },
      { name: 'jun.hxx', text: '나도 데려가라', time: '2주', likes: 0 },
    ],
  },
]

/** 홈 타임라인에는 뜨지 않고 프로필 피드에만 보이는 게시물 (최신순) */
export const PROFILE_ONLY_POSTS: Post[] = [
  {
    id: 'riku-harbor',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '5일 전',
    images: [{ src: '/posts/riku-harbor.jpg', alt: '바다와 배가 보이는 항구 앞에서 아이스 음료를 마시는 리쿠' }],
    caption: '',
    likes: 356,
    likedBy: [sakuya.id, yushi.id],
    comments: [],
    commentsDisabled: true,
  },
  {
    id: 'sion-ramen',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '2일 전',
    images: [{ src: '/posts/sion-ramen.jpg', alt: '라멘집에서 라멘 앞에 앉아 포즈를 취한 오시온 사진 두 장' }],
    caption: '[오시온 라멘 게시물 캡션]',
    likes: 284,
    likedBy: [riku.id, daeyoung.id],
    comments: [],
  },
  {
    id: 'sion-mirror',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '1주 전',
    images: [{ src: '/posts/sion-mirror.jpg', alt: '버건디색 휴대폰으로 거울 셀카를 찍는 오시온' }],
    caption: '[오시온 거울 셀카 게시물 캡션]',
    likes: 302,
    likedBy: [yushi.id, sakuya.id],
    comments: [],
  },
  {
    id: 'sion-boat',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '2주 전',
    images: [{ src: '/posts/sion-boat.jpg', alt: '선글라스를 머리에 얹고 보트에 앉아 있는 오시온' }],
    caption: '[오시온 보트 게시물 캡션]',
    likes: 267,
    likedBy: [ryo.id, riku.id],
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
  [sion.id]: profile(sion, 612, 298, '[오시온 소개글]'),
  [riku.id]: profile(riku, 1203, 341, '[리쿠 소개글]'),
  [yushi.id]: profile(yushi, 845, 402, '[유우시 소개글]'),
  [sakuya.id]: profile(sakuya, 730, 388, '[사쿠야 소개글]'),
  [ryo.id]: profile(ryo, 521, 476, '[료 소개글]'),
  [daeyoung.id]: profile(daeyoung, 389, 412, '[김대영 소개글]'),
}

/**
 * 사파리를 처음 열면 뜨는 인스타그램 알림.
 * 알림을 누르면 postId 게시물이 열리고 comment가 댓글에 추가됩니다. 사용하지 않으려면 null.
 */
export const NOTIFICATION_COMMENT: { postId: string; comment: PostComment } | null = null
