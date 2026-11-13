'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LanguagePicker } from '@/components/language-picker'
import { PasswordScreen } from '@/components/password-screen'
import { LANG_OPTIONS, getLang, setLang, type Lang } from '@/lib/i18n'

const PhoneSimulator = dynamic(
  () => import('@/components/phone/phone-simulator').then((m) => m.PhoneSimulator),
  { ssr: false },
)

const LANG_KEY = 'fishbowl_lang_v1'
const UNLOCK_KEY = 'fishbowl_unlocked_v1'

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
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      const savedLang = readStorage(LANG_KEY) as Lang | null
      const validLang = savedLang && LANG_OPTIONS.some((option) => option.value === savedLang) ? savedLang : null
      if (validLang) await setLang(validLang)
      if (cancelled) return
      setUnlocked(readStorage(UNLOCK_KEY) === '1')
      setReady(validLang !== null)
      setRestored(true)
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  if (!restored) return null
  if (!unlocked)
    return (
      <PasswordScreen
        onUnlock={() => {
          writeStorage(UNLOCK_KEY, '1')
          setUnlocked(true)
        }}
      />
    )
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
