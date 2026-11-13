'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LanguagePicker } from '@/components/language-picker'
import { PasswordScreen } from '@/components/password-screen'

const PhoneSimulator = dynamic(
  () => import('@/components/phone/phone-simulator').then((m) => m.PhoneSimulator),
  { ssr: false },
)

export function PasswordGate() {
  const [unlocked, setUnlocked] = useState(false)
  const [ready, setReady] = useState(false)
  if (!unlocked) return <PasswordScreen onUnlock={() => setUnlocked(true)} />
  if (!ready) return <LanguagePicker onReady={() => setReady(true)} />
  return <PhoneSimulator />
}
