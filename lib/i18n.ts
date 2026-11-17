export type Lang = 'ko' | 'en' | 'zh' | 'ja'

export const LANG_OPTIONS: { value: Lang; label: string; sub: string; htmlLang: string }[] = [
  { value: 'ko', label: '한국어', sub: 'Korean', htmlLang: 'ko' },
  { value: 'en', label: 'English', sub: 'English', htmlLang: 'en' },
  { value: 'zh', label: '中文', sub: 'Chinese', htmlLang: 'zh-CN' },
  { value: 'ja', label: '日本語', sub: 'Japanese', htmlLang: 'ja' },
]

/** 고른 언어를 기억하는 localStorage 키 */
export const LANG_STORAGE_KEY = 'fishbowl_lang_v1'

let currentLang: Lang = 'ko'
let dictionary: Record<string, string> = {}

export function getLang() {
  return currentLang
}

export async function setLang(lang: Lang) {
  currentLang = lang
  dictionary = expandDictionary(
    lang === 'en'
      ? (await import('./i18n/en.json')).default
      : lang === 'zh'
        ? (await import('./i18n/zh.json')).default
        : lang === 'ja'
          ? (await import('./i18n/ja.json')).default
          : {},
  )
  const option = LANG_OPTIONS.find((o) => o.value === lang)
  if (option) document.documentElement.lang = option.htmlLang
  if (lang !== 'ko') startDomTranslation()
}

const HANGUL = /[가-힣ㄱ-ㅎㅏ-ㅣ]/
const SPEAKER = /^[가-힣A-Za-z\u4e00-\u9fff]{1,10}:\s*/

// Chat scripts are played one line (and one ' / ' bubble) at a time, but the dictionary
// stores whole multi-line messages, so line-level pairs are derived here.
function expandDictionary(source: Record<string, string>) {
  const out: Record<string, string> = { ...source }
  const add = (ko: string, translated: string) => {
    const key = ko.trim()
    if (key && HANGUL.test(key) && !(key in out)) out[key] = translated.trim()
  }
  for (const [ko, translated] of Object.entries(source)) {
    if (!ko.includes('\n') && !ko.includes(' / ') && !SPEAKER.test(ko)) continue
    const koLines = ko.split('\n').map((l) => l.trim()).filter(Boolean)
    const trLines = translated.split('\n').map((l) => l.trim()).filter(Boolean)
    if (koLines.length !== trLines.length) continue
    koLines.forEach((line, i) => {
      add(line, trLines[i])
      const koBody = line.replace(SPEAKER, '')
      const trBody = trLines[i].replace(SPEAKER, '')
      add(koBody, trBody)
      const koParts = koBody.split(' / ')
      const trParts = trBody.split(' / ')
      if (koParts.length > 1 && koParts.length === trParts.length) {
        koParts.forEach((part, j) => add(part, trParts[j]))
      }
    })
  }
  return out
}

/** 원문(한국어) 문자열을 현재 언어로 바꿉니다. 사전에 없으면 원문을 그대로 돌려줍니다. */
export function tr(text: string) {
  if (currentLang === 'ko' || !text || !HANGUL.test(text)) return text
  const trimmed = text.trim()
  const hit = dictionary[trimmed] ?? dictionary[trimmed.replace(/\s+/g, ' ')]
  if (hit === undefined) return text
  const lead = text.slice(0, text.length - text.trimStart().length)
  const tail = text.slice(text.trimEnd().length)
  return lead + hit + tail
}

/** 번역된 문장 안의 {NAME} 자리에 플레이어 이름을 넣습니다. */
export function fillName(text: string, name: string) {
  return text.replace(/\{NAME\}|\{이름[아이]?\}/g, name)
}

/** 화면에 남은 한국어 텍스트(UI 라벨 등)를 사전으로 바꿉니다. */
const TIME_LABELS: Record<Lang, Record<string, string>> = {
  ko: {},
  en: { 오전: 'AM', 오후: 'PM', 어제: 'Yesterday', 오늘: 'Today' },
  zh: { 오전: '上午', 오후: '下午', 어제: '昨天', 오늘: '今天' },
  ja: { 오전: '午前', 오후: '午後', 어제: '昨日', 오늘: '今日' },
}

function translateTime(value: string) {
  const labels = TIME_LABELS[currentLang]
  return value.replace(/(어제|오늘)?\s?(오전|오후)\s?(\d{1,2}:\d{2})/g, (_m, day: string | undefined, half: string, time: string) => {
    const clock = currentLang === 'en' ? `${time} ${labels[half]}` : `${labels[half]}${time}`
    return day ? `${labels[day]} ${clock}` : clock
  })
}

function translateText(value: string) {
  if (!HANGUL.test(value)) return value
  let next = tr(value)
  if (next === value) {
    const match = value.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/su)
    if (match && match[2]) {
      const inner = tr(match[2])
      if (inner !== match[2]) next = match[1] + inner + match[3]
    }
  }
  if (next === value) next = translateTime(value)
  return fillName(next, playerName)
}

let playerName = ''
export function setPlayerName(name: string) {
  playerName = name
}

const ATTRS = ['placeholder', 'aria-label', 'alt', 'title']
let observer: MutationObserver | null = null

function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const value = node.nodeValue ?? ''
    const next = translateText(value)
    if (next !== value) node.nodeValue = next
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  const el = node as Element
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return
  for (const attr of ATTRS) {
    const value = el.getAttribute(attr)
    if (value && HANGUL.test(value)) {
      const next = translateText(value)
      if (next !== value) el.setAttribute(attr, next)
    }
  }
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
  let current = walker.nextNode()
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const value = current.nodeValue ?? ''
      const next = translateText(value)
      if (next !== value) current.nodeValue = next
    } else {
      const child = current as Element
      for (const attr of ATTRS) {
        const value = child.getAttribute(attr)
        if (value && HANGUL.test(value)) {
          const next = translateText(value)
          if (next !== value) child.setAttribute(attr, next)
        }
      }
    }
    current = walker.nextNode()
  }
}

function startDomTranslation() {
  if (observer) return
  translateNode(document.body)
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateNode(m.target)
      else if (m.type === 'attributes') translateNode(m.target)
      else m.addedNodes.forEach(translateNode)
    }
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS,
  })
}
