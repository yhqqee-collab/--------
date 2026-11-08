'use client'

import { ENDINGS } from '@/lib/template-config'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type TrueEndScreenProps = {
  onRestart: () => void
}

export function TrueEndScreen({ onRestart }: TrueEndScreenProps) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="true-end-title"
      aria-describedby="true-end-desc"
      className={cn(
        'absolute inset-0 z-[80] flex flex-col items-center justify-center bg-gradient-to-b from-[#2a1712] via-[#5c2f22] to-[#e8a87c] px-8 transition-opacity duration-[2400ms] ease-in sm:rounded-[55px]',
        shown ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-4 text-center transition-all delay-[1600ms] duration-1000',
          shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        )}
      >
        <p className="text-xs font-semibold tracking-[0.5em] text-[#ffd9b8]">TRUE END</p>
        <h2 id="true-end-title" className="text-balance text-3xl font-black leading-tight text-white">
          {ENDINGS.true.title}
        </h2>
        <p id="true-end-desc" className="text-pretty text-sm leading-relaxed text-white/75">
          {ENDINGS.true.body}
        </p>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className={cn(
          'absolute bottom-20 min-h-11 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#5c2f22] shadow-lg transition-all delay-[2800ms] duration-700 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          shown ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {ENDINGS.true.button}
      </button>
    </div>
  )
}
