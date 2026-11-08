'use client'

import { Check, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import { APPLICATION_FILTERS, APPLICATIONS, type Application, type ApplicationFilter } from './weverse-data'

type WeverseAppProps = {
  open: boolean
  onClose: () => void
}

export function WeverseApp({ open, onClose }: WeverseAppProps) {
  const [filter, setFilter] = useState<ApplicationFilter>('전체')
  const [menuOpen, setMenuOpen] = useState(false)

  const items = filter === '전체' ? APPLICATIONS : APPLICATIONS.filter((item) => item.status === filter)

  return (
    <AppShell open={open} label="Weverse" className="bg-[#F5F6F8] text-[#111]">
      <header className="relative flex shrink-0 items-center justify-center px-4 pb-3 pt-[60px]">
        <h1 className="text-[17px] font-bold tracking-tight">신청 내역</h1>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 bottom-1 flex size-11 items-center justify-center"
        >
          <X className="size-6" strokeWidth={1.8} aria-hidden />
        </button>
      </header>

      <div className="relative shrink-0 px-5 pb-3 pt-1">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          className="-ml-1 flex min-h-11 items-center gap-1.5 px-1 text-[15px] text-[#333]"
        >
          {filter}
          <ChevronDown className={cn('size-4 transition-transform', menuOpen && 'rotate-180')} aria-hidden />
        </button>
        {menuOpen && (
          <ul
            role="listbox"
            aria-label="신청 상태"
            className="absolute left-4 top-full z-10 w-36 overflow-hidden rounded-xl bg-white py-1 shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
          >
            {APPLICATION_FILTERS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === filter}
                  onClick={() => {
                    setFilter(option)
                    setMenuOpen(false)
                  }}
                  className="flex min-h-11 w-full items-center justify-between px-4 text-left text-[14px]"
                >
                  {option}
                  {option === filter && <Check className="size-4 text-[#111]" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-[10px] pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <li className="py-20 text-center text-[14px] text-[#999]">신청 내역이 없습니다.</li>
        ) : (
          items.map((item) => <ApplicationCard key={item.id} item={item} />)
        )}
      </ul>
    </AppShell>
  )
}

function ApplicationCard({ item }: { item: Application }) {
  return (
    <li className="rounded-[22px] bg-white px-4 pb-5 pt-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <span
        className={cn(
          'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
          item.status === '당첨' ? 'border-[#00CBC8] text-[#00A9A6]' : 'border-[#C9CCD1] text-[#8B8F96]',
        )}
      >
        {item.status}
      </span>
      <div className="mt-4 border-t border-[#F0F1F3] pt-4">
        <p className="text-[13px] font-extrabold">{item.artist}</p>
        <p className="mt-1.5 text-[15px] leading-[1.45] text-[#444]">{item.title}</p>
      </div>
    </li>
  )
}
