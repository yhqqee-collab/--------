'use client'

import { BookOpen, Bookmark, ChevronLeft, ChevronRight, Copy, Lock, RotateCw, Share } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { NaverMapPage } from './naver-map-page'
import { POST } from './post-data'
import { PostPage } from './post-page'
import { TabSwitcher, type TabSummary } from './tab-switcher'

type TabKind = 'store' | 'post' | 'map' | 'motel' | 'blank'
type Tab = { id: string; kind: TabKind }

const INITIAL_TABS: Tab[] = [
  { id: 'tab-store', kind: 'store' },
  { id: 'tab-post', kind: 'post' },
  { id: 'tab-map', kind: 'map' },
  { id: 'tab-motel', kind: 'motel' },
]

function Favicon({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={cn('flex size-[14px] items-center justify-center rounded-[3px] text-[8.5px] font-black text-white', className)} aria-hidden>
      {children}
    </span>
  )
}

function MotelPage() {
  return (
    <div className="min-h-full bg-[#f7f7f7] px-5 pb-10 pt-5 text-[#202124]">
      <div className="flex items-center justify-between">
        <span className="text-[22px] font-bold tracking-[-0.04em] text-[#111]">[사이트 이름]</span>
        <span className="rounded-full bg-[#ff4b55] px-3 py-1 text-[11px] font-semibold text-white">[배지]</span>
      </div>
      <div className="mt-7 rounded-[22px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
        <p className="text-[13px] font-medium text-[#777]">[카드 라벨]</p>
        <h2 className="mt-2 text-[28px] font-bold tracking-[-0.06em]">[카드 제목]</h2>
        <p className="mt-1 text-[14px] text-[#666]">[날짜 · 부가 정보]</p>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-[14px] bg-[#f5f5f5] p-3">
          <div><p className="text-[11px] text-[#888]">[항목 1]</p><p className="mt-1 text-[17px] font-semibold">[값 1]</p></div>
          <div><p className="text-[11px] text-[#888]">[항목 2]</p><p className="mt-1 text-[17px] font-semibold text-[#ff4b55]">[값 2]</p></div>
        </div>
        <div className="mt-5 flex min-h-[46px] w-full items-center justify-center rounded-[12px] bg-[#ff4b55] text-[15px] font-semibold text-white" aria-hidden="true">[버튼 텍스트]</div>
      </div>
    </div>
  )
}

function StartPage() {
  const favorites = [
    { label: '네이버', bg: 'bg-[#03C75A]', mark: 'N' },
    { label: '[사이트]', bg: 'bg-[#0A84FF]', mark: 'A' },
    { label: '유튜브', bg: 'bg-[#FF0033]', mark: '▶' },
    { label: '[사이트]', bg: 'bg-[#1C2B5A]', mark: 'B' },
  ]
  return (
    <div className="min-h-full bg-[#F2F2F7] px-5 pt-4">
      <h2 className="text-[20px] font-bold text-black">즐겨찾기</h2>
      <ul className="mt-3 grid grid-cols-4 gap-3">
        {favorites.map((f) => (
          <li key={f.label} className="flex flex-col items-center gap-1.5">
            <span className={cn('flex size-[58px] items-center justify-center rounded-[14px] text-[22px] font-black text-white', f.bg)} aria-hidden>
              {f.mark}
            </span>
            <span className="text-[11px] text-black/70">{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StorePage() {
  return (
    <img
      src="/images/safari/smtown-keyring.jpg"
      alt="SMTOWN &STORE 상품 페이지: 2025 NCT WISH 1st CONCERT TOUR 'INTO THE WISH Our WISH' FANLIGHT DOLL KEY RING, 15,000원"
      className="block h-auto w-full"
    />
  )
}

const TAB_META: Record<TabKind, { title: string; url: string; favicon: ReactNode; render: () => ReactNode }> = {
  store: {
    title: 'FANLIGHT DOLL KEY RING - SMTOWN &STORE',
    url: 'smtownandstore.com',
    favicon: <Favicon className="bg-[#2E2E40]">&amp;</Favicon>,
    render: () => <StorePage />,
  },
  post: {
    title: POST.title,
    url: 'm.community.example',
    favicon: <Favicon className="bg-[#0A84FF]">A</Favicon>,
    render: () => <PostPage />,
  },
  motel: {
    title: '[웹페이지 제목]',
    url: 'www.example.com',
    favicon: <Favicon className="bg-[#ff4b55]">B</Favicon>,
    render: () => <MotelPage />,
  },
  map: {
    title: '길찾기 - 네이버 지도',
    url: 'm.map.naver.com',
    favicon: <Favicon className="bg-[#03C75A]">N</Favicon>,
    render: () => <NaverMapPage />,
  },
  blank: {
    title: '시작 페이지',
    url: '',
    favicon: <Favicon className="bg-black/30">S</Favicon>,
    render: () => <StartPage />,
  },
}

function PageFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-white pt-[54px]">{children}</div>
}

export function SafariApp({ open, onVisit }: { open: boolean; onVisit?: () => void }) {
  const [tabs, setTabs] = useState<Tab[]>(INITIAL_TABS)
  const [activeId, setActiveId] = useState(INITIAL_TABS[0].id)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const activeMeta = TAB_META[activeTab.kind]

  const selectTab = (id: string) => {
    setActiveId(id)
    setSwitcherOpen(false)
  }

  const closeTab = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id)
    if (remaining.length === 0) {
      const blank = { id: `tab-${Date.now()}`, kind: 'blank' as const }
      setTabs([blank])
      setActiveId(blank.id)
      setSwitcherOpen(false)
      return
    }
    setTabs(remaining)
    if (id === activeId) setActiveId(remaining[remaining.length - 1].id)
  }

  const newTab = () => {
    const blank = { id: `tab-${Date.now()}`, kind: 'blank' as const }
    setTabs((prev) => [...prev, blank])
    selectTab(blank.id)
  }

  const summaries: TabSummary[] = tabs.map((t) => ({
    id: t.id,
    title: TAB_META[t.kind].title,
    favicon: TAB_META[t.kind].favicon,
    preview: <PageFrame>{TAB_META[t.kind].render()}</PageFrame>,
  }))

  return (
    <section
      aria-label="사파리"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex origin-[62%_93%] flex-col overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <div
        inert={switcherOpen}
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          switcherOpen ? 'scale-[0.9] rounded-[24px] opacity-0' : 'scale-100 opacity-100',
        )}
      >
        {tabs.map((t) => (
          <div
            key={t.id}
            className={cn(
              'min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]',
              t.id === activeTab.id ? 'animate-in fade-in zoom-in-[0.96] duration-300' : 'hidden',
            )}
          >
            <PageFrame>{TAB_META[t.kind].render()}</PageFrame>
          </div>
        ))}

        <div className="shrink-0 border-t border-black/[0.08] bg-[#F9F9F9]/95 px-3 pb-[30px] pt-2 backdrop-blur-xl">
          <div className="flex h-[44px] items-center gap-2 rounded-[13px] bg-white px-3 shadow-[0_1px_6px_rgba(0,0,0,0.1)]">
            <BookOpen className="size-[17px] shrink-0 text-black/80" strokeWidth={2} aria-label="읽기 도구" />
            <p className="flex min-w-0 flex-1 items-center justify-center gap-1 text-[15px] text-black">
              {activeMeta.url ? (
                <>
                  <Lock className="size-[11px] shrink-0 text-black/50" strokeWidth={2.5} aria-hidden />
                  <span className="truncate">{activeMeta.url}</span>
                </>
              ) : (
                <span className="text-black/40">검색 또는 웹사이트 이름 입력</span>
              )}
            </p>
            <RotateCw className="size-[16px] shrink-0 text-black/80" strokeWidth={2.25} aria-label="새로고침" />
          </div>
          <div className="mt-2.5 flex items-center justify-between px-3 text-[#0A84FF]">
            <ChevronLeft className="size-[25px]" strokeWidth={2} aria-label="뒤로" />
            <ChevronRight className="size-[25px] opacity-30" strokeWidth={2} aria-label="앞으로" />
            <Share className="size-[21px]" strokeWidth={2} aria-label="공유" />
            <Bookmark className="size-[21px]" strokeWidth={2} aria-label="책갈피" />
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              aria-label={`탭 보기, ${tabs.length}개 열림`}
              className="transition-opacity active:opacity-40"
            >
              <Copy className="size-[21px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <TabSwitcher
        open={switcherOpen}
        tabs={summaries}
        activeId={activeTab.id}
        onSelect={selectTab}
        onClose={closeTab}
        onNewTab={newTab}
        onDone={() => setSwitcherOpen(false)}
      />
    </section>
  )
}
