'use client'

import dynamic from 'next/dynamic'

const PhoneSimulator = dynamic(
  () => import('@/components/phone/phone-simulator').then((m) => m.PhoneSimulator),
  { ssr: false },
)

export function PasswordGate() {
  return <PhoneSimulator />
}
