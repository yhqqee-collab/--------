'use client'

import { useEffect, useState } from 'react'

export function useClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 1000 * 15)
    return () => window.clearInterval(id)
  }, [])

  return now
}

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function formatTime(date: Date | null) {
  if (!date) return '9:41'
  const hours = date.getHours() % 12 || 12
  return `${hours}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function formatLockDate(date: Date | null) {
  const d = date ?? new Date(2026, 10, 6)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}`
}

export function weekday(date: Date | null) {
  return WEEKDAYS[(date ?? new Date(2026, 10, 6)).getDay()]
}

export function callName(fullName: string) {
  const given = fullName.length >= 3 ? fullName.slice(1) : fullName
  const last = given.charCodeAt(given.length - 1)
  const isHangul = last >= 0xac00 && last <= 0xd7a3
  if (!isHangul) return `${given}야`
  return (last - 0xac00) % 28 === 0 ? `${given}야` : `${given}아`
}
