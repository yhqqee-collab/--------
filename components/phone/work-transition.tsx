'use client'

import { useEffect, useState } from 'react'

type WorkTransitionProps = {
  text: string
  onDone: () => void
}

type Phase = 'enter' | 'show' | 'leave'

const FADE_MS = 1000
const HOLD_MS = 4000

export function WorkTransition({ text, onDone }: WorkTransitionProps) {
  const [phase, setPhase] = useState<Phase>('enter')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('show'), 50),
      setTimeout(() => setPhase('leave'), FADE_MS + HOLD_MS),
      setTimeout(onDone, FADE_MS * 2 + HOLD_MS),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <section
      role="status"
      aria-live="polite"
      className={`absolute inset-0 z-[70] flex items-center justify-center bg-black px-6 transition-opacity duration-1000 sm:rounded-[55px] ${
        phase === 'show' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="whitespace-pre-line text-balance text-center text-[17px] font-semibold leading-relaxed tracking-[-0.01em] text-white">{text}</p>
    </section>
  )
}
