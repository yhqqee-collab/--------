'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export const POSTYPE_URL = 'https://posty.pe/ppbh8sic'

type PostypeGateProps = {
  day: number
  onRestart: () => void
}

export function PostypeGate({ day, onRestart }: PostypeGateProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="postype-title"
      aria-describedby="postype-desc"
      className={cn(
        'absolute inset-0 z-[90] flex items-center justify-center bg-black/70 px-8 backdrop-blur-sm transition-opacity duration-500 sm:rounded-[55px]',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'flex w-full max-w-[280px] flex-col items-center gap-5 rounded-3xl bg-white px-6 py-7 text-center shadow-2xl transition-all duration-500',
          shown ? 'translate-y-0 scale-100' : 'translate-y-2 scale-95',
        )}
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-neutral-500">{`${day}일차 완료`}</p>
          <h2 id="postype-title" className="text-lg font-bold leading-snug text-balance text-neutral-900">
            풀버전은 포스타입에서 플레이 가능합니다
          </h2>
          <p id="postype-desc" className="text-xs leading-relaxed text-pretty text-neutral-500">
            더욱 몰아치는 세 남자의 추궁 폭탄에서 살아남아 보세요
          </p>
        </div>
        <div className="flex w-full flex-col gap-2.5">
          <a
            href={POSTYPE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            포스타입으로 이동하기
            <ExternalLink className="size-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-11 rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            처음부터 다시하기
          </button>
        </div>
      </div>
    </div>
  )
}
