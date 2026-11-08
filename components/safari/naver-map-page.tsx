import { ArrowUpDown, Bike, Bus, Car, ChevronDown, Footprints, Menu, StickyNote, TrainFront, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAVER_GREEN = '#03C75A'
const LINE_2 = '#00A84D'

export const ROUTE = {
  from: '[출발지]',
  to: '[도착지]',
  summary: ['[교통수단]', '[환승 정보]'],
  totalMinutes: 34,
  departAt: '16:30',
  arriveAt: '17:04',
  fare: '1,400원',
  note: '[경로 메모]',
}

const MODES = [
  { label: '대중교통', icon: Bus, active: true },
  { label: '자동차', icon: Car },
  { label: '도보', icon: Footprints },
  { label: '자전거', icon: Bike },
]

const SEGMENTS = [
  { kind: 'walk', grow: 9, label: '도보' },
  { kind: 'subway', grow: 6, label: '2' },
  { kind: 'walk', grow: 8, label: '8분' },
] as const

function RouteInputs() {
  return (
    <div className="flex items-center gap-2 px-4 pt-3">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[10px] border border-black/[0.08] bg-white">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] px-3 py-[9px]">
          <span className="size-[9px] shrink-0 rounded-full" style={{ backgroundColor: NAVER_GREEN }} aria-hidden />
          <span className="sr-only">출발</span>
          <span className="truncate text-[14.5px] font-medium text-black">{ROUTE.from}</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-[9px]">
          <span className="size-[9px] shrink-0 rounded-full bg-[#F04452]" aria-hidden />
          <span className="sr-only">도착</span>
          <span className="truncate text-[14.5px] font-medium text-black">{ROUTE.to}</span>
        </div>
      </div>
      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white text-black/50">
        <ArrowUpDown className="size-[16px]" strokeWidth={2.25} aria-label="출발지 도착지 바꾸기" />
      </span>
    </div>
  )
}

function ModeTabs() {
  return (
    <div className="mt-3 flex border-b border-black/[0.06] px-2">
      {MODES.map(({ label, icon: Icon, active }) => (
        <span
          key={label}
          className={cn(
            'flex flex-1 items-center justify-center gap-[3px] whitespace-nowrap border-b-2 pb-2 pt-1 text-[12.5px] font-semibold',
            active ? 'text-black' : 'border-transparent text-black/35',
          )}
          style={active ? { borderColor: NAVER_GREEN } : undefined}
        >
          <Icon className="size-[14px]" strokeWidth={2.25} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  )
}

function RouteNote() {
  return (
    <aside aria-label="메모" className="mx-4 mt-3 rounded-[12px] border border-[#F5A524]/40 bg-[#FFF7E6] px-3 py-2.5">
      <p className="flex items-center gap-1 text-[11.5px] font-bold text-[#B26A00]">
        <StickyNote className="size-[12px]" strokeWidth={2.5} aria-hidden />내 메모
      </p>
      <p className="mt-1 flex gap-1.5 text-pretty text-[13.5px] font-semibold leading-[1.5] text-[#5C3B00]">
        <TriangleAlert className="mt-[2px] size-[15px] shrink-0 text-[#E5484D]" strokeWidth={2.5} aria-hidden />
        {ROUTE.note}
      </p>
    </aside>
  )
}

function SegmentBar() {
  return (
    <div className="mt-3 flex h-[20px] gap-[3px]" aria-hidden>
      {SEGMENTS.map((s, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-center rounded-full text-[10.5px] font-bold',
            s.kind === 'walk' ? 'bg-[#E9ECEF] text-black/45' : 'text-white',
          )}
          style={{ flexGrow: s.grow, backgroundColor: s.kind === 'subway' ? LINE_2 : undefined }}
        >
          {s.kind === 'walk' ? (
            <span className="flex items-center gap-0.5">
              <Footprints className="size-[10px]" strokeWidth={2.5} />
              {s.label}
            </span>
          ) : (
            s.label
          )}
        </div>
      ))}
    </div>
  )
}

type Step = { title: string; sub?: string; marker: 'start' | 'board' | 'alight' | 'walk' | 'end' }

const STEPS: Step[] = [
  { title: ROUTE.from, sub: '출발', marker: 'start' },
  { title: '[승차역]', sub: '[노선 · 방면]', marker: 'board' },
  { title: '[하차역]', sub: '[이동 정보]', marker: 'alight' },
  { title: '[도보 안내]', sub: '도보 8분', marker: 'walk' },
  { title: ROUTE.to, sub: '도착', marker: 'end' },
]

function StepMarker({ marker }: { marker: Step['marker'] }) {
  if (marker === 'board' || marker === 'alight') {
    return (
      <span className="flex size-[20px] items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: LINE_2 }}>
        2
      </span>
    )
  }
  if (marker === 'walk') {
    return (
      <span className="flex size-[20px] items-center justify-center rounded-full bg-[#E9ECEF] text-black/50">
        <Footprints className="size-[11px]" strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span className="flex size-[20px] items-center justify-center">
      <span className={cn('size-[11px] rounded-full ring-[3px]', marker === 'start' ? 'ring-[#03C75A]/25' : 'bg-[#F04452] ring-[#F04452]/25')} style={marker === 'start' ? { backgroundColor: NAVER_GREEN } : undefined} />
    </span>
  )
}

function RouteSteps() {
  return (
    <ol className="mt-4 space-y-0">
      {STEPS.map((step, i) => (
        <li key={step.title} className="relative flex gap-3 pb-3.5 last:pb-0">
          {i < STEPS.length - 1 && (
            <span
              className={cn('absolute left-[9px] top-[22px] h-[calc(100%-22px)] w-[2px]', i === 1 ? '' : 'bg-[#E9ECEF]')}
              style={i === 1 ? { backgroundColor: LINE_2 } : undefined}
              aria-hidden
            />
          )}
          <StepMarker marker={step.marker} />
          <div className="min-w-0 pt-[1px]">
            <p className="text-[13.5px] font-semibold leading-tight text-black">{step.title}</p>
            {step.sub && <p className="mt-0.5 text-[11.5px] text-black/45">{step.sub}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

function ResultCard() {
  return (
    <section aria-label="경로 결과" className="mx-4 mt-3 rounded-[14px] border border-black/[0.06] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-1.5">
  <span className="shrink-0 whitespace-nowrap rounded-[4px] px-1.5 py-[2px] text-[10.5px] font-bold text-white" style={{ backgroundColor: NAVER_GREEN }}>
  최적
  </span>
  <p className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[12px] font-semibold tracking-tight text-black/60">
          <TrainFront className="size-[13px]" strokeWidth={2.25} style={{ color: LINE_2 }} aria-hidden />
          {ROUTE.summary[0]} <span aria-hidden>➔</span>
          <span className="sr-only">에서</span> {ROUTE.summary[1]}
        </p>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <p className="text-[26px] font-extrabold leading-none tracking-tight text-black">
          {ROUTE.totalMinutes}
          <span className="text-[17px]">분</span>
          <span className="ml-1 text-[14px] font-semibold text-black/50">소요</span>
        </p>
        <p className="text-right text-[12px] leading-tight text-black/45">
          {ROUTE.departAt} 출발 · {ROUTE.arriveAt} 도착
          <br />
          카드 {ROUTE.fare}
        </p>
      </div>

      <SegmentBar />
      <RouteSteps />
    </section>
  )
}

export function NaverMapPage() {
  return (
    <div className="min-h-full bg-[#F5F6F8] pb-6">
      <header className="flex items-center justify-between bg-white px-4 pb-2.5">
        <span className="flex items-center gap-1.5">
          <span className="flex size-[24px] items-center justify-center rounded-[7px] text-[14px] font-black text-white" style={{ backgroundColor: NAVER_GREEN }} aria-hidden>
            N
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-black">
            네이버 <span style={{ color: NAVER_GREEN }}>지도</span>
          </span>
        </span>
        <Menu className="size-[20px] text-black/60" aria-label="메뉴" />
      </header>

      <div className="bg-white pb-0">
        <h2 className="sr-only">길찾기</h2>
        <RouteInputs />
        <ModeTabs />
      </div>

      <div className="flex items-center justify-between gap-2 px-4 pt-3 text-[12px]">
        <span className="min-w-0 truncate font-semibold text-black/70">
          최적 <span className="font-normal text-black/30">· 최소시간 · 최소환승 · 최소도보</span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold text-black/60">
          오늘 {ROUTE.departAt} 출발
          <ChevronDown className="size-[13px]" strokeWidth={2.5} aria-hidden />
        </span>
      </div>

      <RouteNote />
      <ResultCard />
    </div>
  )
}
