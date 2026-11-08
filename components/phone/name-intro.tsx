'use client'

import { useState } from 'react'
import { Wallpaper } from './wallpaper'

type NameIntroProps = {
  onStart: (name: string) => void
}

export function NameIntro({ onStart }: NameIntroProps) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trimmed) onStart(trimmed)
  }

  return (
    <section aria-label="플레이어 이름 입력" className="absolute inset-0 z-40">
      <Wallpaper dim />
      <div className="relative flex h-full flex-col items-center justify-center px-7 text-white">
        <p className="text-[13px] font-medium tracking-[0.2em] text-pink-200/80">PROLOGUE</p>
        <h2 className="mt-3 text-center text-[24px] font-semibold leading-snug text-balance">
          당신의 이름을
          <br />
          알려주세요
        </h2>
        <p className="mt-2 text-center text-[14px] leading-relaxed text-white/70 text-pretty">
          대화 속 모든 사람들이 이 이름으로 당신을 부르게 됩니다.
        </p>

        <form onSubmit={submit} className="mt-8 flex w-full flex-col gap-3">
          <label htmlFor="player-name" className="sr-only">
            플레이어 이름
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="예: 지민"
            maxLength={10}
            autoComplete="off"
            autoFocus
            className="h-12 w-full rounded-2xl border border-white/15 bg-black/40 px-4 text-center text-[17px] text-white outline-none backdrop-blur-xl placeholder:text-white/35 focus:border-pink-300/70 focus:ring-2 focus:ring-pink-300/30"
          />
          <button
            type="submit"
            disabled={!trimmed}
            className="h-12 w-full rounded-2xl bg-pink-500 text-[16px] font-semibold text-white transition-colors hover:bg-pink-400 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
          >
            게임 시작
          </button>
        </form>
      </div>
    </section>
  )
}
