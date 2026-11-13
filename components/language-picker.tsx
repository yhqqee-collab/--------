'use client'

import { useState } from 'react'
import { LANG_OPTIONS, setLang, type Lang } from '@/lib/i18n'

export function LanguagePicker({ onReady }: { onReady: () => void }) {
  const [loading, setLoading] = useState<Lang | null>(null)

  async function choose(lang: Lang) {
    setLoading(lang)
    await setLang(lang)
    onReady()
  }

  return (
    <section className="flex w-full max-w-xs flex-col items-center gap-8 px-6 text-center text-white">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">어장 키우기 Uni ver.</h2>
        <p className="text-sm text-white/60">언어를 선택하세요 · Select language · 选择语言</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {LANG_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={loading !== null}
            onClick={() => choose(option.value)}
            lang={option.htmlLang}
            className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-left transition hover:border-pink-300/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-pink-300 disabled:opacity-60"
          >
            <span className="text-lg font-semibold">{option.label}</span>
            <span className="text-xs text-white/50">{loading === option.value ? '...' : option.sub}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
