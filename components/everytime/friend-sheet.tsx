'use client'

import { MessageCirclePlus, Pointer, Search, Star, UserPlus } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { FRIENDS, type Friend } from './everytime-data'

const COLLAPSED_HEIGHT = 200
const TOP_GAP = 54

const byName = (a: Friend, b: Friend) => a.name.localeCompare(b.name, 'ko')

export function FriendSheet({ onSelect }: { onSelect: (friend: Friend) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [starred, setStarred] = useState(() => new Set(FRIENDS.filter((f) => f.starred).map((f) => f.id)))
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startHeight: number; maxHeight: number; moved: boolean } | null>(null)

  const friends = useMemo(() => {
    const matches = FRIENDS.filter((friend) => friend.name.includes(query.trim()))
    const top = matches.filter((f) => starred.has(f.id)).sort(byName)
    const rest = matches.filter((f) => !starred.has(f.id)).sort(byName)
    return [...top, ...rest]
  }, [query, starred])

  const toggleStar = (id: string) =>
    setStarred((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const sheet = sheetRef.current
    const parent = sheet?.parentElement
    if (!sheet || !parent) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      startY: event.clientY,
      startHeight: sheet.offsetHeight,
      maxHeight: parent.offsetHeight - TOP_GAP,
      moved: false,
    }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current
    if (!state) return
    const delta = state.startY - event.clientY
    if (Math.abs(delta) > 4) state.moved = true
    setDragHeight(Math.min(state.maxHeight, Math.max(COLLAPSED_HEIGHT, state.startHeight + delta)))
  }

  const onPointerUp = () => {
    const state = drag.current
    drag.current = null
    if (!state) return
    if (!state.moved || dragHeight === null) {
      setExpanded((value) => !value)
    } else {
      setExpanded(dragHeight > (COLLAPSED_HEIGHT + state.maxHeight) / 2)
    }
    setDragHeight(null)
  }

  return (
    <div
      ref={sheetRef}
      className={cn(
        'absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-[22px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        dragHeight === null && 'transition-[height] duration-300 ease-out',
      )}
      style={{ height: dragHeight ?? (expanded ? `calc(100% - ${TOP_GAP}px)` : COLLAPSED_HEIGHT) }}
    >
      <button
        type="button"
        aria-label={expanded ? '친구 목록 접기' : '친구 목록 펼치기'}
        aria-expanded={expanded}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex h-7 w-full shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <span className="h-1 w-10 rounded-full bg-[#D5D5D5]" />
      </button>

      <div className="flex shrink-0 items-center gap-3 px-4 pb-2">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-[#F2F2F2] px-3">
          <Search className="size-4 text-[#999]" aria-hidden />
          <span className="sr-only">친구 검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="이름으로 친구를 검색하세요"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#AAA]"
          />
        </label>
        <span className="flex size-9 items-center justify-center" aria-hidden>
          <UserPlus className="size-6 text-[#333]" />
        </span>
      </div>

      <ul
        className={cn(
          'min-h-0 flex-1 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          expanded ? 'overflow-y-auto' : 'overflow-hidden',
        )}
      >
        {friends.map((friend) => (
          <FriendRow
            key={friend.id}
            friend={friend}
            starred={starred.has(friend.id)}
            onToggleStar={() => toggleStar(friend.id)}
            onSelect={friend.classes ? () => onSelect(friend) : undefined}
          />
        ))}
        {friends.length === 0 && <li className="py-8 text-center text-[13px] text-[#AAA]">검색 결과가 없습니다</li>}
      </ul>
    </div>
  )
}

function FriendRow({
  friend,
  starred,
  onToggleStar,
  onSelect,
}: {
  friend: Friend
  starred: boolean
  onToggleStar: () => void
  onSelect?: () => void
}) {
  const nameBlock = (
    <>
      <span className="block text-[16px] text-[#222]">{friend.name}</span>
      {friend.free && (
        <span className="mt-0.5 flex items-center gap-1 text-[12px] text-[#999]">
          <span className="size-1.5 rounded-full bg-[#CCC]" aria-hidden />
          공강
        </span>
      )}
    </>
  )

  return (
    <li className="flex min-h-[64px] items-center gap-3 border-b border-[#F0F0F0] py-2">
      <button
        type="button"
        onClick={onToggleStar}
        aria-label={starred ? `${friend.name} 즐겨찾기 해제` : `${friend.name} 즐겨찾기`}
        aria-pressed={starred}
        className="flex size-9 shrink-0 items-center justify-center"
      >
        <Star
          className={cn('size-6', starred ? 'fill-[#FFC83D] text-[#FFC83D]' : 'text-[#CFCFCF]')}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {onSelect ? (
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          {nameBlock}
        </button>
      ) : (
        <div className="min-w-0 flex-1">{nameBlock}</div>
      )}

      <div className="flex shrink-0 items-center rounded-full border border-[#EAEAEA] px-3 py-1.5" aria-hidden>
        <Pointer className="size-5 text-[#333]" strokeWidth={1.6} />
        <span className="mx-3 h-4 w-px bg-[#E5E5E5]" />
        <MessageCirclePlus className="size-5 text-[#333]" strokeWidth={1.6} />
      </div>
    </li>
  )
}
