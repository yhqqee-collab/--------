'use client'

import { useState, type FormEvent } from 'react'

const PASSWORD = '4419'

export function PasswordScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (value === PASSWORD) {
      onUnlock()
      return
    }
    setError(true)
    setValue('')
  }

  return (
    <section className="flex w-full max-w-xs flex-col items-center gap-8 px-6 text-center text-white">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">어장 키우기 Uni ver.</h2>
        <p className="text-sm text-white/60">비밀번호를 입력하세요 · Password · 密码</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <label htmlFor="game-password" className="sr-only">
          비밀번호
        </label>
        <input
          id="game-password"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ''))
            setError(false)
          }}
          aria-invalid={error}
          aria-describedby={error ? 'password-error' : undefined}
          className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-center text-2xl tracking-[0.5em] text-white outline-none transition placeholder:text-white/30 focus-visible:border-pink-300/60"
          placeholder="••••"
        />
        {error && (
          <p id="password-error" role="alert" className="text-sm text-pink-300">
            비밀번호가 틀렸습니다 · Wrong password · 密码错误
          </p>
        )}
        <button
          type="submit"
          disabled={value.length < 4}
          className="rounded-2xl bg-pink-300 px-5 py-4 font-semibold text-black transition hover:bg-pink-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300 disabled:opacity-50"
        >
          확인 · Enter · 确认
        </button>
      </form>
    </section>
  )
}
