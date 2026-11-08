'use client'

import { Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

const BATTERY = 82

export function StatusBar({ locked, dark = false }: { locked: boolean; dark?: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-[30px] pt-[4px] text-white transition-[filter] duration-300',
        dark && 'invert',
      )}
    >
      <div className="flex w-[110px] justify-center">
        {locked && <span className="text-[15px] font-semibold tracking-tight">SKT</span>}
      </div>

      <div className="flex w-[110px] items-center justify-center gap-[6px]">
        <span className="flex items-end gap-[1.5px]" aria-label="셀룰러 신호 4칸">
          {[4.5, 6.5, 9, 11.5].map((h) => (
            <span key={h} className="w-[3px] rounded-[1px] bg-white" style={{ height: h }} />
          ))}
        </span>
        <Wifi className="size-[17px]" strokeWidth={2.75} aria-label="Wi-Fi 연결됨" />
        <span className="flex items-center gap-[1.5px]">
          <span className="relative h-[13px] w-[26px] overflow-hidden rounded-[4.2px] bg-white/35">
            <span className="absolute inset-y-0 left-0 bg-white" style={{ width: `${BATTERY}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[10.5px] font-bold leading-none tracking-tight text-black">
              {BATTERY}
            </span>
          </span>
          <span className="h-[4.5px] w-[1.5px] rounded-r-full bg-white/40" />
          <span className="sr-only">배터리 {BATTERY}%</span>
        </span>
      </div>
    </div>
  )
}
