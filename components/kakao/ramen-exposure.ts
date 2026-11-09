import { CHARACTERS, GROUP_MEMBERS } from '@/lib/template-config'

/** Day 1 점심에 정문 라멘야를 고르면 이어지는 [단톡방 목격담 → 갠톡 추궁 → 게임오버] 시퀀스 */

export type ExposureLine = { sender?: string; text: string; time: string }

const RYO = GROUP_MEMBERS.ryo.name
const DAEYOUNG = GROUP_MEMBERS.daeyoung.name
const SAKUYA = GROUP_MEMBERS.sakuya.name

/** 단톡방 한 줄 사이 간격 */
export const GROUP_LINE_GAP_MS = 2500

const ryoSighting = (partner: string): ExposureLine[] => [
  { sender: RYO, text: '1시 인문관 교양 수업 들어가기 전에', time: '오후 12:15' },
  { sender: RYO, text: '정문 쪽에서 밥 먹으려고 움직이는 길인데', time: '오후 12:15' },
  { sender: RYO, text: `라멘야 안에 여주 누나랑 ${partner} 형이랑 밥 먹고 있는데요?`, time: '오후 12:15' },
  { sender: RYO, text: '둘이 분위기가 심상치 않은데', time: '오후 12:16' },
  { sender: RYO, text: '사귀나...', time: '오후 12:16' },
  { sender: RYO, text: 'ㅋㅋㅋㅋㅋ', time: '오후 12:16' },
]

export type ExposureCase = 'yushi' | 'riku'

export const GROUP_LINES: Record<ExposureCase, ExposureLine[]> = {
  yushi: [
    ...ryoSighting(CHARACTERS.c.name),
    { sender: DAEYOUNG, text: '헐 뭐야 진짜??? ㅋㅋㅋ', time: '오후 12:17' },
    { sender: SAKUYA, text: '오 대박', time: '오후 12:17' },
  ],
  riku: [
    ...ryoSighting(CHARACTERS.b.name),
    { sender: DAEYOUNG, text: '오 ㅋㅋㅋ', time: '오후 12:17' },
    { sender: DAEYOUNG, text: '형 누나들 해명 ㄱㄱ', time: '오후 12:17' },
  ],
}

/** 유우시와 라멘야 → 리쿠 추궁 */
export const RIKU_DELAY_MS = 1500
export const RIKU_LINE_GAP_MS = 1500
export const rikuAccusation = (solo: boolean): ExposureLine[] => [
  { text: `${solo ? '혼자 대본 본다더니' : '선약 잇다더니'} 유우시랑 밥 먹어??`, time: '오후 12:18' },
  { text: '나한테 왜 거짓말햇어...?', time: '오후 12:18' },
]
export const RIKU_REPLY_TEXT = '내가 다 설명할게'
export const RIKU_REPLY_TIME = '오후 12:19'
export const RIKU_FINAL_DELAY_MS = 7000
export const RIKU_FINAL_GAP_MS = 3000
export const RIKU_FINAL: ExposureLine[] = [
  { text: 'ㅋㅋ...', time: '오후 12:20' },
  { text: '유우시랑 다 얘기 햇는데', time: '오후 12:20' },
  { text: '양다리 제대로 걸쳣네?', time: '오후 12:21' },
  { text: '사람 하나 바보 만들고...', time: '오후 12:21' },
  { text: '내가 그렇게 호구 같아 보였어?', time: '오후 12:21' },
]

/** 리쿠와 라멘야 → 유우시 추궁 */
export const YUSHI_DELAY_MS = 10000
export const YUSHI_LINE_GAP_MS = 2000
export const yushiAccusation = (solo: boolean): ExposureLine[] => [
  { text: `${solo ? '혼자 발표 준비한다더니' : '수진이랑 밥 먹는다더니'} 리쿠랑 있어 ?`, time: '오후 12:18' },
  { text: 'ㅋㅋ...', time: '오후 12:18' },
  { text: '나한테 거짓말하고 리쿠랑 밥 먹으러 갈 이유가 있나 ?', time: '오후 12:19' },
]

/** 시온 공통 */
export const SION_DELAY_MS = 6000
export const SION_LINE_GAP_MS = 2000
export const SION_FIRST: ExposureLine[] = [
  { text: '단톡 뭐야? ㅋㅋ', time: '오후 12:19' },
  { text: '점심에 둘이 왜 같이 있어?', time: '오후 12:19' },
]
export const SION_SILENCE_MS = 20000
export const SION_FINAL_GAP_MS = 3000
export const SION_FINAL: ExposureLine[] = [
  { text: '애들한테 얘기 다 들었어', time: '오후 12:20' },
  { text: '너 레전드다 진짜...ㅋㅋ', time: '오후 12:20' },
  { text: '나중에 얼굴 어떻게 보려고 그래?', time: '오후 12:20' },
  { text: '이따가 애들 앞에서 해명할 거지? ㅋㅋ', time: '오후 12:21' },
]

/** 두 남주의 마지막 카톡까지 읽은 뒤 게임오버 창이 뜨기까지 */
export const EXPOSURE_GAME_OVER_DELAY_MS = 2500
/** 근무(오전 수업) 종료 후 단톡방 첫 메시지까지 */
export const EXPOSURE_START_DELAY_MS = 4000

export const EXPOSURE_ALERT: Record<ExposureCase, string> = {
  yushi: `[단톡방 목격담]\n정문 라멘야에서 료에게 목격되어 ${CHARACTERS.b.name}와 ${CHARACTERS.a.name}에게 양다리가 발각되었습니다.`,
  riku: `[단톡방 목격담]\n정문 라멘야에서 료에게 목격되어 ${CHARACTERS.c.name}와 ${CHARACTERS.a.name}에게 양다리가 발각되었습니다.`,
}
