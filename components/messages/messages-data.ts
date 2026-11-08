export type Message = { from: 'them' | 'me'; text: string }

export type Thread = {
  id: string
  name: string
  initials: string
  time: string
  dateLabel: string
  unread?: boolean
  isBusiness?: boolean
  previewIndex?: number
  messages: Message[]
}

/*
 * 메시지(문자) 앱 콘텐츠.
 * owner(사용자 이름)가 문자 본문의 수신자 이름으로 들어갑니다.
 * isBusiness: true면 회색 기업 아이콘 + '문자 메시지' 표시
 * time: 목록에 보이는 수신 시간 / dateLabel: 대화 화면 상단 날짜
 */
export function getThreads(owner: string): Thread[] {
  return [
    {
      id: 'cj-logistics',
      name: 'CJ대한통운',
      initials: 'CJ',
      time: '오전 10:20',
      dateLabel: '오늘 오전 10:20',
      unread: true,
      isBusiness: true,
      messages: [
        {
          from: 'them',
          text: `[CJ대한통운] ${owner}님, 기다리시던 상품이 오늘 배송될 예정입니다.\n▶ 예상시간: 14시~16시\n▶ 배송상품: [무신사] 스탠다드 브이넥 가디건 외 1건\n▶ 배송기사: 김*철 (010-XXXX-XXXX)`,
        },
      ],
    },
    {
      id: 'shinhan-card',
      name: '신한카드',
      initials: '신한',
      time: '10/24 (토)',
      dateLabel: '10월 24일 (토) 오후 10:45',
      isBusiness: true,
      messages: [
        {
          from: 'them',
          text: `[신한카드] 승인\n${owner}님\n85,000원 (일시불)\n10/24 22:45\n(주)더프라이빗라운지\n*누적금액: 342,500원`,
        },
      ],
    },
    {
      id: 'nice-auth',
      name: 'NICE인증',
      initials: 'NICE',
      time: '10/23 (금)',
      dateLabel: '10월 23일 (금) 오후 7:10',
      isBusiness: true,
      messages: [
        {
          from: 'them',
          text: '[Web발신]\n[NICE평가정보] 본인확인 인증번호 [482910]를 입력해 주세요. (타인노출금지)',
        },
      ],
    },
    {
      id: 'kakaopay',
      name: '카카오페이',
      initials: 'pay',
      time: '10/22 (목)',
      dateLabel: '10월 22일 (목) 오후 11:30',
      isBusiness: true,
      messages: [
        {
          from: 'them',
          text: '[카카오페이] 결제완료\n▶ 결제금액: 12,000원\n▶ 사용처: 스카이코인노래연습장\n▶ 일시: 10/22 23:30',
        },
      ],
    },
    {
      id: 'skt-114',
      name: '114',
      initials: '114',
      time: '10/19 (월)',
      dateLabel: '10월 19일 (월) 오전 9:00',
      isBusiness: true,
      messages: [
        {
          from: 'them',
          text: '[SKT] 10월 청구요금 안내\n고객님의 10월 명세서가 발행되었습니다. 이번 달 납부하실 금액은 65,400원입니다. 상세 내역은 앱에서 확인 가능합니다.',
        },
      ],
    },
  ]
}
