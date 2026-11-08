'use client'

import { DEFAULT_OWNER_NAME } from '@/lib/template-config'
import { useState } from 'react'
import { Camera, Flashlight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Wallpaper } from './wallpaper'

const DEFAULT_NAME = DEFAULT_OWNER_NAME

type LockScreenProps = {
  visible: boolean
  name?: string
  onUnlock: (name: string) => void
  dateLabel: string
}

export function LockScreen({ visible, name: initialName = '', onUnlock, dateLabel }: LockScreenProps) {
  const [typed, setName] = useState('')
  const name = typed || initialName

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onUnlock(name.trim() || DEFAULT_NAME)
  }

  return (
    <section
      aria-label="잠금 화면"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        'absolute inset-0 z-30 transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <Wallpaper />

      <div className="relative flex h-full flex-col items-center px-6 pb-[34px] pt-[58px] text-white">
        <Lock className="size-[15px] text-[#3a3a3c]" strokeWidth={2.5} aria-hidden />
        <p className="mt-3 text-[26px] font-semibold tracking-tight text-[#2c2c2e]">{dateLabel}</p>

        <form
          onSubmit={submit}
          className="mt-auto mb-auto w-[272px] overflow-hidden rounded-[14px] bg-[#1c1c1e]/70 text-center shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl animate-[alert-pop_420ms_cubic-bezier(0.32,0.72,0,1)_both]"
        >
          {initialName ? (
            <div className="px-4 pb-4 pt-[18px]">
              <h2 className="text-[17px] font-semibold leading-tight">{initialName}의 iPhone</h2>
              <p className="mt-1 text-[13px] leading-snug text-white/75">잠금을 해제하려면 아래 버튼을 누르세요.</p>
            </div>
          ) : (
          <div className="px-4 pb-4 pt-[18px]">
            <h2 className="text-[17px] font-semibold leading-tight">누구의 iPhone인가요?</h2>
            <p className="mt-1 text-[13px] leading-snug text-white/75">
              Face ID를 인식할 수 없습니다.
              <br />
              사용자의 이름을 입력하면 잠금이 해제됩니다.
            </p>
            <label htmlFor="owner-name" className="sr-only">
              주인공 이름
            </label>
            <input
              id="owner-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
              }}
              placeholder={DEFAULT_NAME}
              maxLength={10}
              autoComplete="off"
              className="mt-3 h-[30px] w-full rounded-[7px] border border-white/10 bg-black/40 px-2 text-[14px] text-white placeholder:text-white/35 outline-none focus:border-[#0A84FF]"
            />
          </div>
          )}
          <button
            type="submit"
            className="h-[44px] w-full border-t border-white/15 text-[17px] font-semibold text-[#0A84FF] transition-colors active:bg-white/10"
          >
            잠금 해제
          </button>
        </form>

        <div className="flex w-full items-center justify-between px-[22px]">
          {[Flashlight, Camera].map((Icon, i) => (
            <span
              key={i}
              aria-hidden
              className="flex size-[50px] items-center justify-center rounded-full bg-black/30 backdrop-blur-xl"
            >
              <Icon className="size-[22px]" strokeWidth={2} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
