export type ApplicationStatus = '당첨' | '미당첨'

export type Application = {
  id: string
  artist: string
  title: string
  status: ApplicationStatus
}

export const APPLICATION_FILTERS = ['전체', '당첨', '미당첨'] as const
export type ApplicationFilter = (typeof APPLICATION_FILTERS)[number]

export const APPLICATIONS: Application[] = [
  {
    id: 'a1',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/24 (토) MBC 쇼! 음악중심 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },
  {
    id: 'a2',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/23 (금) KBS 뮤직뱅크 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },
  {
    id: 'a3',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/22 (목) Mnet 엠카운트다운 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },
  {
    id: 'a4',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/18 (일) SBS 인기가요 ‘I SPY’ 녹화” 참여 신청',
    status: '미당첨',
  },
  {
    id: 'a5',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/17 (토) MBC 쇼! 음악중심 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },
  {
    id: 'a6',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/16 (금) KBS 뮤직뱅크 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },  {
    id: 'a7',
    artist: 'NCT WISH',
    title: 'NCT WISH “10/15 (목) Mnet 엠카운트다운 ‘I SPY’ 사전녹화” 참여 신청',
    status: '미당첨',
  },
]
