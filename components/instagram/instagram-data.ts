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
  followers: 100,
  following: 100,
  bio: '[내 프로필 소개글을 입력하세요]',
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
  const posts = postsOf(person.id)
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

/** afterWork: 그날 데이트(업무) 전환이 끝난 뒤에만 보이는 스토리 */
export type StoryItem = { handle: string; src: string; story?: FriendStory; afterWork?: boolean }

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
]

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

/** 1일 차 기본 스토리 샘플 */
export const STORIES: StoryItem[] = [
  story(sion, '2시간', {
    image: { src: PLACEHOLDER_IMAGE, alt: '[스토리 이미지 설명을 입력하세요]' },
  }),
]

STORIES_BY_DAY[1] = STORIES

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
    id: 'sample-post-a',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '2시간 전',
    location: '[위치 정보 입력]',
    images: [{ src: PLACEHOLDER_IMAGE, alt: '[게시물 이미지 설명을 입력하세요]' }],
    caption: '[게시물 본문 캡션을 입력하세요]',
    likes: 120,
    likedBy: [yushi.id, riku.id],
    comments: [
      { name: MY_HANDLE, mine: true, text: '[내가 남긴 댓글 입력]', time: '1시간', likes: 2 },
      { name: daeyoung.id, text: '[등장인물 댓글 입력]', time: '30분', likes: 1 },
    ],
  },
  {
    id: 'sample-post-b',
    handle: riku.id,
    avatar: avatarOf(riku),
    time: '5시간 전',
    images: [{ src: PLACEHOLDER_IMAGE, alt: '[게시물 이미지 설명을 입력하세요]' }],
    caption: '[게시물 본문 캡션을 입력하세요]',
    likes: 210,
    likedBy: [sakuya.id, ryo.id],
    comments: [],
    commentsDisabled: true,
  },
  {
    id: 'sample-post-c',
    handle: yushi.id,
    avatar: avatarOf(yushi),
    time: '1일 전',
    images: [{ src: PLACEHOLDER_IMAGE, alt: '[게시물 이미지 설명을 입력하세요]' }],
    caption: '[게시물 본문 캡션을 입력하세요]',
    likes: 180,
    likedBy: [sion.id, sakuya.id],
    comments: [],
  },
]

/** 홈 타임라인에는 뜨지 않고 프로필 피드에만 보이는 게시물 템플릿 (최신순) */
export const PROFILE_ONLY_POSTS: Post[] = [
  {
    id: 'profile-only-sample',
    handle: sion.id,
    avatar: avatarOf(sion),
    time: '1주 전',
    images: [{ src: PLACEHOLDER_IMAGE, alt: '[프로필 전용 게시물 이미지 설명]' }],
    caption: '[프로필 전용 게시물 캡션]',
    likes: 150,
    likedBy: [riku.id, daeyoung.id],
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
  [ryo.id]: profile(ryo, 521, 476, '[��� 소개글]'),
  [daeyoung.id]: profile(daeyoung, 389, 412, '[김대영 소개글]'),
}

/**
 * 사파리를 처음 열면 뜨는 인스타그램 알림.
 * 알림을 누르면 postId 게시물이 열리고 comment가 댓글에 추가됩니다. 사용하지 않으려면 null.
 */
export const NOTIFICATION_COMMENT: { postId: string; comment: PostComment } | null = null
