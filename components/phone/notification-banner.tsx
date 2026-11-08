'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { InstagramArt, KakaoArt } from './app-icon-art'

type Phase = 'pending' | 'shown' | 'done'

const ENTER_DELAY_MS = 1600
const VISIBLE_MS = 5200

type NotificationBannerProps = {
  active: boolean
  message: string
  appName?: string
  enterDelayMs?: number
  onOpen: () => void
}

export function NotificationBanner({ active, message, appName = 'KakaoTalk', enterDelayMs = ENTER_DELAY_MS, onOpen }: NotificationBannerProps) {
  const [phase, setPhase] = useState<Phase>('pending')

  useEffect(() => {
    if (!active) {
      setPhase((p) => (p === 'shown' ? 'done' : p))
      return
    }
    if (phase === 'done') return
    const timer = window.setTimeout(
      () => setPhase(phase === 'pending' ? 'shown' : 'done'),
      phase === 'pending' ? enterDelayMs : VISIBLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [active, phase, enterDelayMs])

  const visible = active && phase === 'shown'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        'absolute inset-x-[10px] top-[50px] z-50 transition-[transform,opacity] ease-[cubic-bezier(0.32,0.72,0,1)]',
        visible
          ? 'translate-y-0 scale-100 opacity-100 duration-[650ms]'
          : 'pointer-events-none -translate-y-[140%] scale-[0.96] opacity-0 duration-500',
      )}
    >
      <button
        type="button"
        onClick={() => {
          setPhase('done')
          onOpen()
        }}
        className="flex w-full items-center gap-[11px] rounded-[24px] bg-[#1c1c1e]/70 px-[12px] py-[11px] text-left text-white shadow-[0_10px_40px_rgba(0,0,0,0.38),0_2px_8px_rgba(0,0,0,0.2)] ring-1 ring-inset ring-white/[0.12] backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-200 active:scale-[0.97]"
      >
        <span className="size-[38px] shrink-0 overflow-hidden rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          {appName === 'Instagram' ? <InstagramArt /> : <KakaoArt />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[15px] font-semibold leading-tight tracking-[-0.2px]">{appName}</span>
            <span className="shrink-0 text-[13px] text-white/50">지금</span>
          </span>
          <span className="mt-[2px] line-clamp-2 block text-[14px] leading-[1.3] tracking-[-0.2px] text-white/90">
            {message}
          </span>
        </span>
        <span className="sr-only">{`알림을 눌러 ${appName} 열기`}</span>
      </button>
    </div>
  )
}
