import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type IPhoneFrameProps = {
  children: ReactNode
  onSideButton: () => void
  onHomeBar?: () => void
  homeBarDark?: boolean
}

export function IPhoneFrame({ children, onSideButton, onHomeBar, homeBarDark = false }: IPhoneFrameProps) {
  return (
    <div className="relative h-dvh w-full sm:aspect-[402/874] sm:h-[min(874px,calc(100dvh-3rem))] sm:w-auto sm:rounded-[66px] sm:bg-gradient-to-br sm:from-[#4a4a4f] sm:via-[#1d1d20] sm:to-[#3a3a3e] sm:p-[3px] sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)]">
      <span aria-hidden className="absolute -left-[3px] top-[17%] hidden h-[3.6%] w-[4px] rounded-l-sm bg-[#2c2c30] sm:block" />
      <span aria-hidden className="absolute -left-[3px] top-[24%] hidden h-[7%] w-[4px] rounded-l-sm bg-[#2c2c30] sm:block" />
      <span aria-hidden className="absolute -left-[3px] top-[32.5%] hidden h-[7%] w-[4px] rounded-l-sm bg-[#2c2c30] sm:block" />
      <button
        type="button"
        onClick={onSideButton}
        aria-label="측면 버튼 (화면 잠금)"
        className="absolute -right-[4px] top-[26%] hidden h-[11%] w-[5px] rounded-r-sm bg-[#2c2c30] transition-transform hover:bg-[#3a3a3e] active:translate-x-[-1px] sm:block"
      />

      <div className="relative size-full overflow-hidden bg-black sm:rounded-[63px] sm:p-[9px]">
        <div className="relative isolate size-full overflow-hidden bg-black sm:rounded-[55px]">
          {children}
          <div
            aria-hidden
            className="absolute left-1/2 top-[11px] z-[60] hidden h-[35px] w-[122px] -translate-x-1/2 rounded-full bg-black sm:block"
          />
          <button
            type="button"
            onClick={onHomeBar}
            disabled={!onHomeBar}
            aria-label="홈으로 가기"
            className="group absolute bottom-0 left-1/2 z-[60] flex h-[24px] w-[180px] -translate-x-1/2 items-end justify-center pb-[8px] disabled:pointer-events-none"
          >
            <span
              className={cn(
                'block h-[5px] w-[136px] rounded-full transition-[background-color,transform] duration-200 group-hover:scale-x-105 group-active:-translate-y-[3px]',
                homeBarDark ? 'bg-black/85' : 'bg-white/90',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
