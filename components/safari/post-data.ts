export type PostSection = {
  heading: string
  body: string
}

export type PostComment = {
  id: string
  author: string
  isWriter?: boolean
  text: string
  likes?: number
  time: string
  replies?: PostComment[]
}

/* 사파리 커뮤니티 게시글 콘텐츠 */
export const POST = {
  board: '[게시판 이름]',
  category: '[카테고리]',
  title: '[게시글 제목]',
  date: '2026.10.21 23:42',
  views: 1000,
  likes: 100,
  scraps: 50,
  intro: '[게시글 도입부]',
  sections: [
    { heading: '1. [소제목]', body: '[본문 내용]' },
    { heading: '2. [소제목]', body: '[본문 내용]' },
    { heading: '3. [소제목]', body: '[본문 내용]' },
  ] satisfies PostSection[],
}

export const COMMENTS: PostComment[] = [
  { id: 'c1', author: '익명1', text: '[댓글 내용]', likes: 10, time: '10/21 23:58' },
  { id: 'c2', author: '익명2', isWriter: true, text: '[작성자 댓글]', likes: 5, time: '10/22 00:20' },
  {
    id: 'c3',
    author: '익명3',
    text: '[댓글 내용]',
    time: '10/22 01:47',
    replies: [{ id: 'c3-r1', author: '익명2', isWriter: true, text: '[대댓글 내용]', time: '10/22 02:05' }],
  },
]
