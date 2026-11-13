import type { ReactNode } from 'react'

type AppIconProps = {
  name: string
  showLabel?: boolean
  badge?: string
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

export function AppIcon({ name, showLabel = true, badge, onClick, disabled = false, children }: AppIconProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={badge ? `${name}, 읽지 않은 알림 ${badge}개` : name}
      className={`group flex flex-col items-center gap-[5px] outline-none [-webkit-tap-highlight-color:transparent] ${disabled ? 'pointer-events-none' : ''}`}
    >
      <span className="relative block size-[60px] transition-transform duration-150 ease-out group-active:scale-[0.86] group-focus-visible:ring-2 group-focus-visible:ring-white/80 rounded-[22.5%]">
        <span className="relative block size-full overflow-hidden rounded-[22.5%] shadow-[0_3px_12px_rgba(0,0,0,0.25)] transition-[filter] duration-150 group-active:brightness-75">
          {children}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[22.5%] bg-gradient-to-b from-white/25 via-white/0 via-45% to-black/[0.06] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.75),inset_0_-1px_2px_rgba(0,0,0,0.12),inset_0_0_0_0.5px_rgba(255,255,255,0.35)]"
          />
        </span>
        {badge && (
          <span className="absolute -right-[8px] -top-[7px] flex h-[23px] min-w-[23px] items-center justify-center rounded-full bg-[#F2393A] px-[7px] text-[13.5px] font-medium leading-none tracking-[-0.01em] text-white shadow-[0_1px_3px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.35)]">
            {badge}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="max-w-[76px] truncate text-[11.5px] font-normal leading-tight tracking-[-0.01em] text-[#1c1c1e] [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
          {name}
        </span>
      )}
    </button>
  )
}
