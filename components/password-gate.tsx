'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LanguagePicker } from '@/components/language-picker'
import { LANG_OPTIONS, getLang, setLang, type Lang } from '@/lib/i18n'

const PhoneSimulator = dynamic(
  () => import('@/components/phone/phone-simulator').then((m) => m.PhoneSimulator),
  { ssr: false },
)

const LANG_KEY = 'fishbowl_lang_v1'

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

export function PasswordGate() {
  const [restored, setRestored] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      const savedLang = readStorage(LANG_KEY) as Lang | null
      const validLang = savedLang && LANG_OPTIONS.some((option) => option.value === savedLang) ? savedLang : null
      if (validLang) await setLang(validLang)
      if (cancelled) return
      setReady(validLang !== null)
      setRestored(true)
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  if (!restored) return null
  if (!ready)
    return (
      <LanguagePicker
        onReady={() => {
          writeStorage(LANG_KEY, getLang())
          setReady(true)
        }}
      />
    )
  return <PhoneSimulator />
}
