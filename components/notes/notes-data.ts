export type Note = {
  id: string
  date: string
  time: string
  body: string
}

/** 최신 메모가 위로 오도록 정렬되어 있습니다. 첫 줄이 제목으로 표시됩니다. */
export const NOTES: Note[] = [
  {
    id: 'library',
    date: '2026. 10. 28.',
    time: '오후 1:40',
    body: '도서관 책 반납 금요일까지!!\n아 맞다 도서관 책 반납 기한 이번 주 금요일까지!! 까먹지 말고 꼭 챙겨가기 연체 절대 안 됨',
  },
  {
    id: 'budget',
    date: '2026. 10. 24.',
    time: '오후 11:55',
    body: '다음 달 돈 관리\n다음 달 알바비 들어오면 폰 요금 내고, 교통비 빼고... 식비를 좀 줄여야겠다 진짜 ㅠㅠ 배달 어플 지우자',
  },
  {
    id: 'recipe',
    date: '2026. 10. 24.',
    time: '오전 10:12',
    body: '가을 신메뉴 레시피\n헷갈리지 말기 ㅠㅠ\n- 몽블랑 라떼: 밤 시럽 2 + 샷 2 + 우유 + 밤 다이스\n- 애플 시나몬 티: 베이스 티백 + 사과청 1스푼 + 시나몬 스틱',
  },
  {
    id: 'netflix',
    date: '2026. 10. 19.',
    time: '오후 11:30',
    body: '주말에 넷플 볼 거 목록\n- 아케인 시즌2\n- 지옥 시즌2\n- 흑백요리사 마저 보기\n(아 피곤해서 맨날 보다가 잠듦 ㅠ)',
  },
  {
    id: 'oliveyoung',
    date: '2026. 10. 15.',
    time: '오후 2:15',
    body: '올영 세일 살 거\n- 클렌징워터\n- 트러블 패치\n- 립밤\n- 바디워시\n* 3만 원 이상 무조건 쿠폰 먹이기!!',
  },
]

export function splitNote(note: Note) {
  const [title, ...rest] = note.body.split('\n')
  return { title, content: rest.join('\n') }
}
