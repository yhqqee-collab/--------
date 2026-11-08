export type BoardPost = {
  id: string
  board: string
  title: string
  body: string
  time: string
  likes: number
  comments: number
}

export type ClassBlock = {
  id: string
  name: string
  room: string
  day: number
  start: number
  end: number
  color: string
}

export const SCHOOL_NAME = '한국대'

export const FAVORITE_BOARDS = ['자유게시판', '비밀게시판', '졸업생게시판', '새내기게시판', '장터게시판']

export const POSTS: BoardPost[] = [
  {
    id: 'p1',
    board: '자유게시판',
    title: '중도 4층 콘센트 자리 다 찼네요',
    body: '시험기간도 아닌데 왜 이렇게 사람이 많지',
    time: '방금',
    likes: 3,
    comments: 5,
  },
  {
    id: 'p2',
    board: '비밀게시판',
    title: '연애 상담 좀 해주세요',
    body: '애인이 요즘 폰을 자꾸 뒤집어 놓는데 제가 예민한 걸까요',
    time: '12분 전',
    likes: 18,
    comments: 32,
  },
  {
    id: 'p3',
    board: '자유게시판',
    title: '학식 오늘 뭐 나와요?',
    body: '돈까스면 갑니다',
    time: '24분 전',
    likes: 2,
    comments: 7,
  },
  {
    id: 'p4',
    board: '장터게시판',
    title: '전공책 팝니다 (경영통계)',
    body: '필기 거의 없고 상태 좋아요. 쪽지 주세요',
    time: '1시간 전',
    likes: 0,
    comments: 1,
  },
  {
    id: 'p5',
    board: '새내기게시판',
    title: '동아리 아직 신입 받는 곳 있나요',
    body: '밴드나 사진 동아리 찾고 있어요',
    time: '2시간 전',
    likes: 6,
    comments: 11,
  },
  {
    id: 'p6',
    board: '비밀게시판',
    title: '친구 애인 봤는데 말해야 할까',
    body: '어제 성수에서 다른 사람이랑 있는 거 봤어요… 그냥 아는 사이일 수도 있겠죠?',
    time: '3시간 전',
    likes: 41,
    comments: 67,
  },
]

export const TIMETABLE_DAYS = ['월', '화', '수', '목', '금']
export const TIMETABLE_START_HOUR = 9
export const TIMETABLE_END_HOUR = 18

export const CLASSES: ClassBlock[] = [
  { id: 'c1', name: '경영통계', room: '경영관 301', day: 0, start: 9, end: 10.5, color: '#F2A5A5' },
  { id: 'c2', name: '마케팅원론', room: '경영관 204', day: 0, start: 13, end: 14.5, color: '#A5C8F2' },
  { id: 'c3', name: '교양영어', room: '인문관 112', day: 1, start: 10.5, end: 12, color: '#B9E0A5' },
  { id: 'c4', name: '경영통계', room: '경영관 301', day: 2, start: 9, end: 10.5, color: '#F2A5A5' },
  { id: 'c5', name: '조직행동론', room: '경영관 405', day: 2, start: 15, end: 16.5, color: '#D2B4F0' },
  { id: 'c6', name: '교양영어', room: '인문관 112', day: 3, start: 10.5, end: 12, color: '#B9E0A5' },
  { id: 'c7', name: '마케팅원론', room: '경영관 204', day: 3, start: 13, end: 14.5, color: '#A5C8F2' },
  { id: 'c8', name: '현대사회와 연애', room: '사회관 B101', day: 4, start: 14, end: 16, color: '#F5D59A' },
]
