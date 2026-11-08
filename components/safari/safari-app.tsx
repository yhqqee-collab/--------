'use client'

import { BookOpen, Bookmark, ChevronLeft, ChevronRight, Copy, Lock, RotateCw, Share } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TabSwitcher, type TabSummary } from './tab-switcher'

type TabKind = 'blank'
type Tab = { id: string; kind: TabKind }

const INITIAL_TABS: Tab[] = [{ id: 'tab-start', kind: 'blank' }]

function Favicon({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={cn('flex size-[14px] items-center justify-center rounded-[3px] text-[8.5px] font-black text-white', className)} aria-hidden>
      {children}
    </span>
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
          <li key={`${f.label}-${f.mark}`} className="flex flex-col items-center gap-1.5">
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

const TAB_META: Record<TabKind, { title: string; url: string; favicon: ReactNode; render: () => ReactNode }> = {
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
