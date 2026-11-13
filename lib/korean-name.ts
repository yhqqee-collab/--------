export function hasBatchim(name: string) {
  const lastChar = name.charCodeAt(name.length - 1)
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return false
  return (lastChar - 0xac00) % 28 > 0
}

/** 대본의 기본 이름. 입력한 이름으로 바뀌며 받침 유무에 따라 호칭이 달라집니다. */
const SCRIPT_NAME = '여주'

/**
 * 받침 있음(윤정): 여주야 → 윤정아, 여주는 → 윤정이는, 여주가 → 윤정이가, 여주 누나 → 윤정 누나
 * 받침 없음(여주): 여주야 → 여주야, 여주는 → 여주는
 */
function replaceScriptName(text: string, name: string, batchim: boolean) {
  if (name === SCRIPT_NAME) return text
  return text.replace(/(?<!보)여주(야|아)?(?!:)/g, (_match, vocative: string | undefined, offset: number, whole: string) => {
    if (vocative) return name + (batchim ? '아' : '야')
    const rest = whole.slice(offset + SCRIPT_NAME.length)
    if (/^\s?(누나|언니|씨|님)/.test(rest)) return name
    return batchim ? `${name}이` : name
  })
}

export function replaceUserName(text: string, name: string) {
  if (!name) return text
  const batchim = hasBatchim(name)

  const replaced = text
    .replace(/\{이름아\}/g, name + (batchim ? '아' : '야'))
    .replace(/\{이름이\}/g, batchim ? name + '이' : name)
    .replace(/\{이름\}/g, name)
  return replaceScriptName(replaced, name, batchim)
}

/** 받침 유무에 따라 형태가 바뀌는 조사: [받침 있을 때, 받침 없을 때] */
const LITERARY_PARTICLES: Record<string, [string, string]> = {
  를: ['을', '를'],
  을: ['을', '를'],
  가: ['이', '가'],
  이: ['이', '가'],
  는: ['은', '는'],
  은: ['은', '는'],
  와: ['과', '와'],
  과: ['과', '와'],
  랑: ['이랑', '랑'],
  이랑: ['이랑', '랑'],
  라도: ['이라도', '라도'],
  이라도: ['이라도', '라도'],
}

/**
 * 엔딩 서술용 문어체 치환. 이름 뒤에 접미사 '이'를 붙이지 않습니다.
 * 받침 있음(윤정): 여주를 → 윤정을, 여주가 → 윤정이, 여주는 → 윤정은, 여주의 → 윤정의, 여주야 → 윤정아
 */
export function replaceUserNameLiterary(text: string, name: string) {
  if (!name) return text
  const batchim = hasBatchim(name)
  const replaced = text
    .replace(/\{이름아\}/g, name + (batchim ? '아' : '야'))
    .replace(/\{이름이\}/g, batchim ? name + '이' : name)
    .replace(/\{이름\}/g, name)
  if (name === SCRIPT_NAME) return replaced
  return replaced.replace(
    /(?<!보)여주(야|아|이라도|라도|이랑|랑|를|을|가|이|는|은|와|과)?(?!:)/g,
    (_match, suffix: string | undefined) => {
      if (!suffix) return name
      if (suffix === '야' || suffix === '아') return name + (batchim ? '아' : '야')
      const [withBatchim, withoutBatchim] = LITERARY_PARTICLES[suffix]
      return name + (batchim ? withBatchim : withoutBatchim)
    },
  )
}
