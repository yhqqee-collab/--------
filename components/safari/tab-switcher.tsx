import { ChevronDown, Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TabSummary = {
  id: string
  title: string
  favicon: ReactNode
  preview: ReactNode
}

type TabSwitcherProps = {
  open: boolean
  tabs: TabSummary[]
  activeId: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNewTab: () => void
  onDone: () => void
}

export function TabSwitcher({ open, tabs, activeId, onSelect, onClose, onNewTab, onDone }: TabSwitcherProps) {
  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-10 flex flex-col bg-[#E8E8ED] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.08] opacity-0',
      )}
    >
      <h2 className="sr-only">열린 탭</h2>
      <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-x-3.5 gap-y-4 overflow-y-auto px-4 pb-4 pt-[64px] [scrollbar-width:none]">
        {tabs.map((tab, i) => {
          const active = tab.id === activeId
          return (
            <li
              key={tab.id}
              className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
            >
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => onSelect(tab.id)}
                  aria-label={`${tab.title} 탭 열기`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative block aspect-[3/4.4] w-full overflow-hidden rounded-[14px] bg-white text-left shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-95',
                    active && 'ring-[3px] ring-[#0A84FF]',
                  )}
                >
                  {/* Width is 1/0.43 of the card so the page lays out at phone width, then scales to fit */}
                  <div className="pointer-events-none w-[232.56%] origin-top-left scale-[0.43]" aria-hidden>
                    {tab.preview}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onClose(tab.id)}
                  aria-label={`${tab.title} 탭 닫기`}
                  className="absolute right-1.5 top-1.5 flex size-[22px] items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-90"
                >
                  <X className="size-[13px]" strokeWidth={3} />
                </button>
              </div>
              <p className="mt-1.5 flex w-full items-center justify-center gap-1 px-1 text-[12px] font-medium text-black">
                <span className="shrink-0">{tab.favicon}</span>
                <span className="truncate">{tab.title}</span>
              </p>
            </li>
          )
        })}
      </ul>

      <div className="flex shrink-0 items-center justify-between border-t border-black/[0.06] bg-[#F2F2F7]/90 px-5 pb-[34px] pt-2.5 backdrop-blur-xl">
        <button type="button" onClick={onNewTab} aria-label="새 탭" className="text-[#0A84FF] transition-opacity active:opacity-40">
          <Plus className="size-[26px]" strokeWidth={2} />
        </button>
        <span className="flex items-center gap-0.5 text-[15px] font-semibold text-black">
          {tabs.length}개 탭
          <ChevronDown className="size-[14px] text-black/40" strokeWidth={2.75} aria-hidden />
        </span>
        <button type="button" onClick={onDone} className="text-[16px] font-semibold text-[#0A84FF] transition-opacity active:opacity-40">
          완료
        </button>
      </div>
    </div>
  )
}
