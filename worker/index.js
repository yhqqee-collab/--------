/**
 * 플레이 통계 서버 (Cloudflare Worker)
 *
 * - 게임 파일(out 폴더)은 지금처럼 클라우드플레어가 그대로 보여줍니다 (무료·무제한).
 * - /api/track : 게임이 보내는 익명 기록(시작·며칠차·엔딩)을 받아 저장합니다.
 * - /stats     : 통계 화면. 대시보드 변수 STATS_PASSWORD 를 정해 두면 /stats?key=비밀번호 로만 열립니다.
 *
 * 저장은 Durable Object(SQLite)에 합니다. 무료 플랜에서 쓸 수 있고, 따로 만들 필요 없이 배포 때 자동으로 생깁니다.
 */
import { DurableObject } from 'cloudflare:workers'

const EVENTS = new Set(['unlock', 'start', 'day', 'ending'])

/** 엔딩 번호 앞글자 → 캐릭터 이름 (components/kakao/endings.ts 의 ENDING_CHOICES 와 같게 유지) */
const ROUTE_NAMES = { a: '오시온', b: '리쿠', c: '유우시', harem: '다같살(히든)', catastrophe: '파국' }
const ENDING_TYPES = { happy: '해피', obsessive: '집착', breakup: '헤어짐', harem: '히든', catastrophe: '파국' }

const KST_OFFSET_SEC = 9 * 60 * 60

export class StatsStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        lang TEXT
      );
      CREATE TABLE IF NOT EXISTS reached (
        player TEXT NOT NULL,
        event TEXT NOT NULL,
        value TEXT NOT NULL,
        label TEXT,
        at INTEGER NOT NULL,
        PRIMARY KEY (player, event, value)
      );
    `)
  }

  track({ p, e, v, l, lang }) {
    const now = Date.now()
    this.sql.exec(
      `INSERT INTO players (id, first_seen, last_seen, lang) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen, lang = COALESCE(excluded.lang, players.lang)`,
      p,
      now,
      now,
      lang,
    )
    // 같은 사람이 같은 기록을 여러 번 보내도 한 번만 셉니다 (다시하기·새로고침 대비)
    this.sql.exec(`INSERT OR IGNORE INTO reached (player, event, value, label, at) VALUES (?, ?, ?, ?, ?)`, p, e, v, l, now)
  }

  summary() {
    const rows = (query, ...args) => this.sql.exec(query, ...args).toArray()
    const one = (query, ...args) => rows(query, ...args)[0] ?? {}
    const todayStart = (() => {
      const kstNow = Math.floor(Date.now() / 1000) + KST_OFFSET_SEC
      return (kstNow - (kstNow % 86400) - KST_OFFSET_SEC) * 1000
    })()

    return {
      players: one(`SELECT COUNT(*) AS n FROM players`).n ?? 0,
      newToday: one(`SELECT COUNT(*) AS n FROM players WHERE first_seen >= ?`, todayStart).n ?? 0,
      activeToday: one(`SELECT COUNT(*) AS n FROM players WHERE last_seen >= ?`, todayStart).n ?? 0,
      steps: rows(`SELECT event, COUNT(*) AS n FROM reached WHERE event IN ('unlock', 'start') GROUP BY event`),
      days: rows(
        `SELECT CAST(value AS INTEGER) AS day, COUNT(*) AS n FROM reached WHERE event = 'day' GROUP BY day ORDER BY day`,
      ),
      endingPlayers: one(`SELECT COUNT(DISTINCT player) AS n FROM reached WHERE event = 'ending'`).n ?? 0,
      endings: rows(
        `SELECT value AS id, MAX(label) AS label, COUNT(*) AS n FROM reached WHERE event = 'ending' GROUP BY value ORDER BY n DESC`,
      ),
      langs: rows(`SELECT COALESCE(lang, '?') AS lang, COUNT(*) AS n FROM players GROUP BY lang ORDER BY n DESC`),
      daily: rows(
        `SELECT date(first_seen / 1000 + ${KST_OFFSET_SEC}, 'unixepoch') AS d, COUNT(*) AS n
         FROM players GROUP BY d ORDER BY d DESC LIMIT 14`,
      ),
    }
  }
}

function store(env) {
  return env.STATS.get(env.STATS.idFromName('main'))
}

const clean = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '')

async function handleTrack(request, env) {
  if (request.method !== 'POST') return new Response('POST only', { status: 405 })
  let data
  try {
    data = JSON.parse(await request.text())
  } catch {
    return new Response('bad json', { status: 400 })
  }
  const p = clean(data?.p, 64)
  const e = clean(data?.e, 16)
  if (!/^[\w-]{6,64}$/.test(p) || !EVENTS.has(e)) return new Response('bad event', { status: 400 })
  await store(env).track({
    p,
    e,
    v: clean(data.v, 40),
    l: clean(data.l, 120),
    lang: clean(data.lang, 8) || null,
  })
  return new Response(null, { status: 204 })
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const pct = (n, total) => (total > 0 ? Math.round((n / total) * 100) : 0)

function bar(label, n, total, note = '') {
  const p = pct(n, total)
  return `<div class="row"><div class="label">${esc(label)}</div>
    <div class="track"><div class="fill" style="width:${Math.max(p, n > 0 ? 2 : 0)}%"></div></div>
    <div class="num">${n}명 <span>${p}%</span>${note ? ` <span>${esc(note)}</span>` : ''}</div></div>`
}

function endingName(id, label) {
  if (label) return label
  const [route, type] = id.split('-')
  return `${ROUTE_NAMES[route] ?? route} · ${ENDING_TYPES[type ?? route] ?? type ?? ''}`
}

function renderStats(s) {
  const step = Object.fromEntries(s.steps.map((r) => [r.event, r.n]))
  const started = step.start ?? 0
  const unlocked = step.unlock ?? 0

  const funnel = [
    bar('비밀번호 통과', unlocked, Math.max(unlocked, started)),
    bar('1일차 시작 (이름 입력)', started, Math.max(unlocked, started)),
    ...s.days.map((d) => bar(`${d.day}일차 도착`, d.n, Math.max(unlocked, started))),
    bar('엔딩 도착', s.endingPlayers, Math.max(unlocked, started)),
  ].join('')

  const routeCounts = {}
  for (const e of s.endings) {
    const route = e.id.split('-')[0]
    routeCounts[route] = (routeCounts[route] ?? 0) + e.n
  }
  const routeTotal = Object.values(routeCounts).reduce((a, b) => a + b, 0)
  const routes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([route, n]) => bar(ROUTE_NAMES[route] ?? route, n, routeTotal))
    .join('')

  const endingTotal = s.endings.reduce((a, b) => a + b.n, 0)
  const endings = s.endings
    .map((e) => {
      const [, type] = e.id.split('-')
      return bar(endingName(e.id, e.label), e.n, endingTotal, ENDING_TYPES[type ?? e.id] ?? '')
    })
    .join('')

  const langNames = { ko: '한국어', en: 'English', zh: '中文', ja: '日本語' }
  const langs = s.langs.map((l) => bar(langNames[l.lang] ?? l.lang, l.n, s.players)).join('')
  const dailyMax = Math.max(1, ...s.daily.map((d) => d.n))
  const daily = s.daily.map((d) => bar(d.d, d.n, dailyMax)).join('')

  const empty = '<p class="empty">아직 기록이 없어요</p>'
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>플레이 통계</title>
<style>
  body{margin:0;background:#0b070c;color:#f3e9f0;font-family:system-ui,-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif}
  main{max-width:760px;margin:0 auto;padding:28px 18px 60px}
  h1{font-size:22px;margin:0 0 4px} .sub{color:#a8949f;font-size:13px;margin:0 0 22px}
  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:26px}
  .card{background:#1a1118;border:1px solid #2e1f2a;border-radius:14px;padding:14px}
  .card b{display:block;font-size:26px;margin-top:4px} .card span{color:#a8949f;font-size:13px}
  section{background:#140d13;border:1px solid #2a1c26;border-radius:14px;padding:16px;margin-bottom:16px}
  h2{font-size:15px;margin:0 0 4px} .hint{color:#8d7a86;font-size:12px;margin:0 0 12px}
  .row{display:grid;grid-template-columns:150px 1fr 110px;gap:10px;align-items:center;margin:7px 0;font-size:13px}
  .label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .track{height:10px;background:#2a1c26;border-radius:6px;overflow:hidden}
  .fill{height:100%;background:#ff7eb0;border-radius:6px}
  .num{text-align:right;font-variant-numeric:tabular-nums} .num span{color:#8d7a86;font-size:12px}
  .empty{color:#8d7a86;font-size:13px}
  @media (max-width:520px){.row{grid-template-columns:1fr 90px}.track{grid-column:1/-1;grid-row:2}}
</style></head><body><main>
<h1>📊 플레이 통계</h1>
<p class="sub">새로고침하면 최신 숫자로 바뀌어요 · 한 사람이 여러 번 해도 한 번만 세요</p>
<div class="cards">
  <div class="card"><span>전체 플레이어</span><b>${s.players}</b></div>
  <div class="card"><span>오늘 새로 온 사람</span><b>${s.newToday}</b></div>
  <div class="card"><span>오늘 플레이한 사람</span><b>${s.activeToday}</b></div>
  <div class="card"><span>엔딩까지 본 사람</span><b>${s.endingPlayers}</b></div>
</div>
<section><h2>어디까지 갔을까?</h2><p class="hint">사람들이 몇 일차까지 왔는지 보여줘요. 갑자기 확 줄어드는 곳에서 많이 그만둔 거예요.</p>${started || unlocked ? funnel : empty}</section>
<section><h2>누구를 골랐을까?</h2><p class="hint">마지막 선택에서 고른 사람</p>${routes || empty}</section>
<section><h2>엔딩별 인원</h2>${endings || empty}</section>
<section><h2>언어</h2>${langs || empty}</section>
<section><h2>날짜별 새 플레이어 (최근 14일)</h2>${daily || empty}</section>
</main></body></html>`
}

async function handleStats(request, env) {
  const password = env.STATS_PASSWORD
  if (password && new URL(request.url).searchParams.get('key') !== password) {
    return new Response('비밀번호가 필요해요: /stats?key=비밀번호', {
      status: 401,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }
  const summary = await store(env).summary()
  return new Response(renderStats(summary), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url)
    try {
      if (pathname === '/api/track') return await handleTrack(request, env)
      if (pathname === '/stats' || pathname === '/stats/') return await handleStats(request, env)
    } catch (error) {
      return new Response('stats error', { status: 500 })
    }
    return env.ASSETS.fetch(request)
  },
}
