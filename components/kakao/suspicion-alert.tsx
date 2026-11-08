'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type AlertLevel = 'warning' | 'danger'

const WARNING_THRESHOLD = 50
const DANGER_THRESHOLD = 80
const WARNING_MS = 3000
const DANGER_MS = 3500

function levelOf(value: number): AlertLevel | null {
  if (value >= DANGER_THRESHOLD) return 'danger'
  if (value >= WARNING_THRESHOLD) return 'warning'
  return null
}

type SuspicionAlertProps = {
  suspicion?: number
  active: boolean
}

export function SuspicionAlert({ suspicion, active }: SuspicionAlertProps) {
  const [alert, setAlert] = useState<{ level: AlertLevel; key: number } | null>(null)
  const previousRef = useRef(suspicion)

  useEffect(() => {
    if (suspicion === undefined) return
    const before = levelOf(previousRef.current ?? 0)
    const after = levelOf(suspicion)
    previousRef.current = suspicion
    if (!active || !after || after === before) return
    if (before === 'danger') return

    setAlert({ level: after, key: Date.now() })
  }, [suspicion, active])

  useEffect(() => {
    if (!alert) return
    const id = window.setTimeout(() => setAlert(null), alert.level === 'danger' ? DANGER_MS : WARNING_MS)
    return () => window.clearTimeout(id)
  }, [alert])

  if (!alert) return null
  const danger = alert.level === 'danger'

  return (
    <div className="pointer-events-none absolute inset-0 z-30" key={alert.key}>
      {danger && <div className="absolute inset-0 animate-pulse bg-[#D9453B]/25" aria-hidden />}
      <div className={cn('absolute inset-x-0 flex justify-center px-4', danger ? 'top-1/2 -translate-y-1/2' : 'top-[110px]')}>
        <p
          role="alert"
          className={cn(
            'animate-in fade-in zoom-in-95 rounded-2xl px-4 py-3 text-center font-semibold text-white shadow-xl duration-300',
            danger ? 'bg-[#C62828] text-[15px] ring-4 ring-[#C62828]/30' : 'bg-[#F08C1A] text-[13.5px]',
          )}
        >
          {danger ? '🚨 위험! 의심도가 80을 돌파했습니다!' : '⚠️ 주의! 의심도가 50을 돌파했습니다.'}
        </p>
      </div>
    </div>
  )
}
