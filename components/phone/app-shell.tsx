import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AppShellProps = {
  open: boolean
  label: string
  className?: string
  children: ReactNode
}

export function AppShell({ open, label, className, children }: AppShellProps) {
  return (
    <section
      aria-label={label}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
        className,
      )}
    >
      {children}
    </section>
  )
}
