'use client'

import type { SpamNotification } from '@/components/kakao/scripts'

type SpamOverlayProps = {
  spams: (SpamNotification & { key: number })[]
}

const VISIBLE_COUNT = 8

export function SpamOverlay({ spams }: SpamOverlayProps) {
  const visible = spams.slice(-VISIBLE_COUNT).reverse()

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="pointer-events-none absolute inset-0 z-[78] flex flex-col items-center overflow-hidden bg-black/40 px-3 pt-14 backdrop-blur-[1px] sm:rounded-[55px]"
    >
      <ul className="flex w-full flex-col gap-2">
        {visible.map((spam) => (
          <li
            key={spam.key}
            className="flex w-full animate-[spam-in_0.25s_ease-out] items-center gap-3 rounded-2xl border border-red-500/40 bg-zinc-900/95 px-3.5 py-2.5 text-white shadow-2xl"
          >
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FEE500] text-[10px] font-black text-[#3A1D1D]">
              TALK
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-bold text-[#FEE500]">{spam.senderName}</span>
              <span className="truncate text-sm font-medium text-white/90">{spam.text}</span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-red-400">방금</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
