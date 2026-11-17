'use client'

import { useEffect, useState } from 'react'
import { Check, Gauge, Globe, Settings, UserRound } from 'lucide-react'
import { changeSpeed, getSpeed, SPEED_OPTIONS } from '@/lib/game-settings'
import { LANG_OPTIONS, LANG_STORAGE_KEY, getLang, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** 홈 화면 아이콘 그림 (iOS 설정 앱 느낌의 회색 톱니바퀴) */
export function SettingsArt() {
  return (
    <span className="flex size-full items-center justify-center bg-[linear-gradient(180deg,#9ea3ab,#6b7079)]">
      <Settings className="size-[68%] text-[#e9eaec]" strokeWidth={1.6} aria-hidden />
    </span>
  )
}

type SettingsAppProps = {
  open: boolean
  name: string
  onRename: (name: string) => void
}

const MAX_NAME = 10

export function SettingsApp({ open, name, onRename }: SettingsAppProps) {
  const [draft, setDraft] = useState(name)
  const [saved, setSaved] = useState(false)
  const [speed, setSpeedState] = useState(getSpeed)

  useEffect(() => {
    if (!open) return
    setDraft(name)
    setSaved(false)
    setSpeedState(getSpeed())
    // 이름을 바꾼 직후 name 이 바뀌어도 '변경했어요' 표시는 유지하려고 open 만 봅니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const trimmed = draft.trim()
  const canSave = trimmed.length > 0 && trimmed !== name

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onRename(trimmed)
    setSaved(true)
  }

  const pickLang = (value: Lang) => {
    if (value === getLang()) return
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, value)
    } catch {}
    // 화면 전체를 새 언어로 다시 그리기 위해 새로고침합니다. 진행 상황은 자동 저장돼 그대로 이어집니다.
    window.location.reload()
  }

  const pickSpeed = (value: number) => {
    changeSpeed(value)
    setSpeedState(value)
  }

  return (
    <section
      aria-label="설정"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#F2F2F7] text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <header className="shrink-0 px-5 pb-3 pt-[60px]">
        <h2 className="text-[32px] font-bold tracking-tight">설정</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-16">
        <h3 className="mb-1.5 mt-3 flex items-center gap-1.5 px-4 text-[13px] text-[#6d6d72]">
          <UserRound className="size-3.5" aria-hidden />내 이름
        </h3>
        <form onSubmit={submit} className="rounded-[12px] bg-white">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <label htmlFor="settings-name" className="shrink-0 text-[16px]">
              이름
            </label>
            <input
              id="settings-name"
              value={draft}
              maxLength={MAX_NAME}
              autoComplete="off"
              onChange={(e) => {
                setDraft(e.target.value)
                setSaved(false)
              }}
              className="min-w-0 flex-1 bg-transparent text-right text-[16px] text-[#3c3c43] outline-none placeholder:text-[#c7c7cc]"
              placeholder="이름 입력"
            />
          </div>
          <div className="border-t border-black/[0.08] px-4 py-2.5">
            <button
              type="submit"
              disabled={!canSave}
              className="w-full text-[16px] font-medium text-[#007AFF] disabled:text-[#c7c7cc]"
            >
              {saved ? '변경했어요' : '이름 변경'}
            </button>
          </div>
        </form>
        <p className="mt-1.5 px-4 text-[12px] leading-relaxed text-[#6d6d72]">
          앞으로 오는 메시지부터 새 이름으로 불러요. 게임 중에 이미 받은 메시지는 예전 이름 그대로 남아요.
        </p>

        <h3 className="mb-1.5 mt-7 flex items-center gap-1.5 px-4 text-[13px] text-[#6d6d72]">
          <Gauge className="size-3.5" aria-hidden />
          플레이 속도
        </h3>
        <div className="rounded-[12px] bg-white p-1.5">
          <div role="radiogroup" aria-label="플레이 속도" className="grid grid-cols-4 gap-1 rounded-[9px] bg-[#767680]/[0.12] p-0.5">
            {SPEED_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={speed === value}
                onClick={() => pickSpeed(value)}
                className={cn(
                  'rounded-[7px] py-1.5 text-[14px] font-semibold transition-colors',
                  speed === value ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.15)]' : 'text-[#3c3c43]',
                )}
              >
                {value}x
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1.5 px-4 text-[12px] leading-relaxed text-[#6d6d72]">
          답장과 메시지가 오기까지 기다리는 시간이 빨라져요. 선택지는 빨리 골라야 하는 게 아니라서 게임 난이도는 그대로예요.
        </p>

        <h3 className="mb-1.5 mt-7 flex items-center gap-1.5 px-4 text-[13px] text-[#6d6d72]">
          <Globe className="size-3.5" aria-hidden />
          언어
        </h3>
        <ul data-no-record role="radiogroup" aria-label="언어" className="overflow-hidden rounded-[12px] bg-white">
          {LANG_OPTIONS.map((option, index) => {
            const selected = getLang() === option.value
            return (
              <li key={option.value} className={index > 0 ? 'border-t border-black/[0.08]' : undefined}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => pickLang(option.value)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-[16px]"
                >
                  <span translate="no">
                    {option.label}
                    {option.label !== option.sub && <span className="ml-2 text-[13px] text-[#8e8e93]">{option.sub}</span>}
                  </span>
                  {selected && <Check className="size-5 text-[#007AFF]" strokeWidth={2.5} aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-1.5 px-4 text-[12px] leading-relaxed text-[#6d6d72]">
          언어를 바꾸면 화면을 한 번 새로 불러와요. 진행 상황은 그대로 이어져요.
        </p>
      </div>
    </section>
  )
}
