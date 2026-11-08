'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AppIcon } from './app-icon'

export type FolderApp = {
  name: string
  onClick?: () => void
  art: ReactNode
}

type AppFolderProps = {
  name: string
  apps: FolderApp[]
}

export function AppFolder({ name, apps }: AppFolderProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const launch = (app: FolderApp) => {
    setOpen(false)
    app.onClick?.()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${name} 폴더, 앱 ${apps.length}개`}
        aria-expanded={open}
        className="group flex flex-col items-center gap-[5px] outline-none [-webkit-tap-highlight-color:transparent]"
      >
        <span className="grid size-[60px] grid-cols-3 content-start gap-[4px] rounded-[22.5%] bg-white/25 p-[8px] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),0_3px_12px_rgba(0,0,0,0.2)] ring-[0.5px] ring-inset ring-white/35 backdrop-blur-xl transition-transform duration-150 ease-out group-active:scale-[0.86] group-focus-visible:ring-2 group-focus-visible:ring-white/80">
          {apps.slice(0, 9).map((app) => (
            <MiniArt key={app.name}>{app.art}</MiniArt>
          ))}
        </span>
        <span className="max-w-[76px] truncate text-[11.5px] font-normal leading-tight tracking-[-0.01em] text-[#1c1c1e] [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]">
          {name}
        </span>
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} 폴더`}
        aria-hidden={!open}
        inert={!open}
        onClick={() => setOpen(false)}
        className={cn(
          'absolute inset-0 z-30 flex flex-col items-center justify-center gap-[22px] bg-black/15 backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#1c1c1e]">
          {name}
        </h2>
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'grid w-[300px] grid-cols-3 justify-items-center gap-x-[14px] gap-y-[22px] rounded-[38px] bg-white/25 px-[22px] py-[26px] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.15)] ring-[0.5px] ring-inset ring-white/35 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            open ? 'scale-100' : 'scale-75',
          )}
        >
          {apps.map((app) => (
            <AppIcon key={app.name} name={app.name} onClick={() => launch(app)}>
              {app.art}
            </AppIcon>
          ))}
        </div>
      </div>
    </>
  )
}

function MiniArt({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="relative block size-[12px] overflow-hidden rounded-[3px]">
      <span className="absolute left-0 top-0 block size-[60px] origin-top-left scale-[0.2]">{children}</span>
    </span>
  )
}
