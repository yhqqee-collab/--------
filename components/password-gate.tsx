'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LanguagePicker } from '@/components/language-picker'

const PhoneSimulator = dynamic(
  () => import('@/components/phone/phone-simulator').then((m) => m.PhoneSimulator),
  { ssr: false },
)

export function PasswordGate() {
  const [ready, setReady] = useState(false)
  if (!ready) return <LanguagePicker onReady={() => setReady(true)} />
  return <PhoneSimulator />
}
