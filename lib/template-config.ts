/**
 * 프로젝트 공통 설정.
 * 새 프로젝트를 시작할 때 가장 먼저 이 파일의 이름/인물 정보를 바꾸세요.
 * 각 앱의 세부 콘텐츠는 아래 파일에서 채웁니다.
 *  - 카카오톡: components/kakao/chat-data.ts, scripts.ts, replies.ts, suspicion.ts
 *  - 인스타그램: components/instagram/instagram-data.ts
 *  - 캘린더: components/calendar/calendar-data.ts
 *  - 메시지: components/messages/messages-data.ts
 *  - 사파리: components/safari/post-data.ts, naver-map-page.tsx
 *  - 사진: components/photos/photos-data.ts
 *
 * 텍스트 안에서 사용자 이름 치환 토큰을 쓸 수 있습니다 (lib/korean-name.ts).
 *  - {이름}   → 홍길동
 *  - {이름아} → 길동아 / 철수야 (받침에 맞춰 호격)
 *  - {이름이} → 길동이 / 철수  (받침에 맞춰, 뒤에 '가/는/를' 등을 붙여 사용)
 */

export const SITE = {
  title: '어장 키우기 hard ver.',
  description: '어장 키우기 hard ver. — 휴대폰 시뮬레이터 게임',
}

export const DEFAULT_OWNER_NAME = '주인공'

/** 엔딩 화면 문구 */
export const ENDINGS = {
  bad: { label: '[실패]', title: '어장 키우기 실패! 혹시 놓친 게 있는지 휴대폰을 꼼꼼히 살펴보아야 할 것 같다.', button: '처음부터 다시하기' },
  true: { title: '[트루 엔딩 제목]', body: '[트루 엔딩 설명]', button: '다시 플레이하기' },
}

/** 홈 화면 메모 위젯 */
export const HOME_NOTES = [{ who: '', memo: '[메모 위젯 내용]' }]
export const HOME_NOTES_TIME = '어제 오전 3:12'

export type Character = {
  name: string
  handle: string
  avatar?: string
  color: string
}

/** 등장인물 프로필 사진 (이름 기준). 카카오톡·인스타그램에 공통 적용됩니다. */
export const PERSON_AVATARS: Record<string, string> = {
  오시온: '/avatars/sion.jpg',
  '리쿠': '/avatars/riku.jpg',
  '유우시': '/avatars/yushi.jpg',
  사쿠야: '/avatars/sakuya.jpg',
  료: '/avatars/ryo.jpg',
  김대영: '/avatars/daeyoung.jpg',
}

export const CHARACTERS: Record<'a' | 'b' | 'c', Character> = {
  a: { name: '오시온', handle: 'sion_5', avatar: PERSON_AVATARS['오시온'], color: '#4F7DD8' },
  b: { name: '리쿠', handle: 'maeda__', avatar: PERSON_AVATARS['리쿠'], color: '#E8A33D' },
  c: { name: '유우시', handle: 'yushiii', avatar: PERSON_AVATARS['유우시'], color: '#4CAF7A' },
}

/** 인스타그램 아이디 고정값. 댓글·좋아요·DM에는 항상 이 아이디가 노출됩니다. */
export const INSTAGRAM_IDS = {
  sion: { id: 'sion_5', name: '오시온' },
  riku: { id: 'maeda__', name: '리쿠' },
  yushi: { id: 'yushiii', name: '유우시' },
  sakuya: { id: 'fujinagakun', name: '사쿠야' },
  ryo: { id: 'ryoryoryo', name: '료' },
  daeyoung: { id: 'dddaaaeee', name: '김대영' },
} as const

/** 이름을 입력하지 않았을 때 쓰는 여주 인스타그램 아이디 */
export const DEFAULT_INSTAGRAM_ID = 'yeoju'

export type CharacterId = keyof typeof CHARACTERS

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[]
