'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { INSTA_CROSS_MESSAGE_EVENT } from '@/components/instagram/insta-comment-choices'
import { replaceUserName } from '@/lib/korean-name'
import { OWNER_AVATAR } from '@/lib/template-config'
import { cn } from '@/lib/utils'
import { CHATS } from './chat-data'
import { ChatList } from './chat-list'
import { ChatRoom, type Delivery } from './chat-room'
import type { Chat, ChatItem } from './chat-data'
import { cloneSnapshot, type DaySnapshot } from './snapshot'
import {
  groupScriptsForDay,
  preWorkIds,
  scriptsForDay,
  buildSpamSchedule,
  SPAM_START_DELAY_MS,
  SUSPICION_100_GAME_OVER_TEXT,
  syncMembers,
  INSTA_SYNC_SOURCE,
  SYNC_EXTERNAL_SOURCES,
  type SpamNotification,
  type CrossMessage,
} from './scripts'
import { INITIAL_SUSPICION, turnLimit } from './suspicion'

/** 첫 카톡 도착 순서: 앞 사람에게 답장해야 다음 사람의 첫 카톡이 옵니다 (시온 → 리쿠 → 유우시) */
const START_ORDER = ['a', 'b', 'c']
const SEQUENTIAL_START_DELAY_MS = 4000

function personalizeChat(chat: Chat, owner: string): Chat {
  const replaceName = (text: string) => replaceUserName(text, owner)

  return {
    ...chat,
    avatar: chat.self ? OWNER_AVATAR : chat.avatar,
    name: replaceName(chat.name),
    preview: replaceName(chat.preview),
    items: chat.items.map((item) => item.type === 'msg' ? { ...item, text: replaceName(item.text) } : item),
  }
}

type KakaoAppProps = {
  open: boolean
  owner: string
  requestedRoom?: { id: string; nonce: number } | null
  onRoomOpen?: (id: string) => void
  onIncoming?: (id: string, text: string) => void
  onBusted?: (alert?: string) => void
  onDayComplete?: (suspicion: Record<string, number>) => void
  onSpamStart?: () => void
  onSpam?: (spam: SpamNotification) => void
  clockStarted?: boolean
  workEnded?: boolean
  onPreWorkDone?: () => void
  day?: number
  /** 있으면 이 일차 시작 시점의 상태에서 이어서 시작합니다 */
  snapshot?: DaySnapshot | null
  onDaySnapshot?: (snapshot: DaySnapshot) => void
  /** 단톡방 단계 사이의 시간 경과 팝업을 띄우고, 닫히면 done 을 호출합니다 */
  onInterlude?: (text: string, done: () => void) => void
}

export function KakaoApp({ open, owner, requestedRoom, onRoomOpen, onIncoming, onBusted, onDayComplete, onSpamStart, onSpam, clockStarted = false, workEnded = false, onPreWorkDone, day = 1, snapshot, onDaySnapshot, onInterlude }: KakaoAppProps) {
  const interludeCallbackRef = useRef(onInterlude)
  interludeCallbackRef.current = onInterlude
  const interludeShownRef = useRef(new Set<number>())
  const [resume] = useState(() => (snapshot ? cloneSnapshot(snapshot) : null))
  const completedPreWorkRef = useRef(new Set<string>())
  const preWorkFiredRef = useRef(false)
  const flagsRef = useRef(new Set<string>(resume?.flags))
  const addedRef = useRef<Record<string, ChatItem[]>>(resume?.added ?? {})
  const snapshotCallbackRef = useRef(onDaySnapshot)
  snapshotCallbackRef.current = onDaySnapshot
  const dayRef = useRef(day)
  const preWorkCallbackRef = useRef(onPreWorkDone)
  preWorkCallbackRef.current = onPreWorkDone
  const [roomId, setRoomId] = useState<string | null>(null)
  const [completedScripts, setCompletedScripts] = useState<Set<string>>(new Set())
  const [repliedChats, setRepliedChats] = useState<Set<string>>(
    () => new Set(Object.keys(resume?.added ?? {}).filter((id) => resume?.added[id].some((item) => item.type === 'msg' && item.from === 'me'))),
  )
  const markReplied = useCallback((id: string) => {
    setRepliedChats((current) => (current.has(id) ? current : new Set(current).add(id)))
  }, [])
  const startPredecessor = (chatId: string) => {
    const order = START_ORDER.filter((id) => id in scriptsForDay(day))
    const index = order.indexOf(chatId)
    return index > 0 ? order[index - 1] : null
  }
  const [startedRooms, setStartedRooms] = useState<Set<string>>(
    () => new Set(Object.keys(resume?.added ?? {}).filter((id) => resume?.added[id].length)),
  )
  const [unread, setUnread] = useState<Record<string, number>>(() =>
    resume ? {} : Object.fromEntries(CHATS.filter((chat) => chat.unread).map((chat) => [chat.id, chat.unread as number])),
  )
  const [previews, setPreviews] = useState<Record<string, string>>(resume?.previews ?? {})
  const previewsRef = useRef(previews)
  previewsRef.current = previews
  const [suspicion, setSuspicion] = useState<Record<string, number>>(resume?.suspicion ?? INITIAL_SUSPICION)
  const [inbox, setInbox] = useState<Record<string, Delivery[]>>({})
  const [handledNonce, setHandledNonce] = useState<number | null>(null)
  const [turns, setTurns] = useState<Record<string, number>>(resume?.turns ?? {})
  const turnsRef = useRef<Record<string, number>>(resume?.turns ?? {})

  const suspicionRef = useRef(resume?.suspicion ?? INITIAL_SUSPICION)
  const deliverySeqRef = useRef(0)
  const viewingRef = useRef<string | null>(null)
  viewingRef.current = open ? roomId : null
  const callbacksRef = useRef({ onRoomOpen, onIncoming, onBusted, onDayComplete, onSpamStart, onSpam })
  callbacksRef.current = { onRoomOpen, onIncoming, onBusted, onDayComplete, onSpamStart, onSpam }
  const completedScriptsRef = useRef(new Set<string>())
  const dayCompleteFiredRef = useRef(false)
  const bustedRef = useRef(false)
  const syncAnswersRef = useRef(new Map<string, Set<string>>())
  const [readySyncs, setReadySyncs] = useState<ReadonlySet<string>>(new Set())
  const doomedRef = useRef(new Set<string>())
  const finishedDoomRef = useRef(new Set<string>())
  const gameOverAlertRef = useRef<string | undefined>(undefined)

  const chats = useMemo(() => CHATS.map((chat) => personalizeChat(chat, owner)), [owner])
  const visibleChats = chats.map((chat) => ({
    ...chat,
    preview: previews[chat.id] ?? chat.preview,
    time: previews[chat.id] ? '방금 전' : chat.time,
    unread: unread[chat.id] || undefined,
  }))

  const deliver = useCallback((id: string, texts: string[], options?: Pick<Delivery, 'instant' | 'badge' | 'urgent'>) => {
    deliverySeqRef.current += 1
    const delivery: Delivery = { id: deliverySeqRef.current, texts, ...options }
    setInbox((current) => ({ ...current, [id]: [...(current[id] ?? []), delivery] }))
  }, [])

  const openRoom = useCallback((id: string) => {
    setRoomId(id)
    setUnread((current) => ({ ...current, [id]: 0 }))
    setStartedRooms((current) => (current.has(id) ? current : new Set(current).add(id)))
    callbacksRef.current.onRoomOpen?.(id)
  }, [])

  useEffect(() => {
    if (!requestedRoom || requestedRoom.nonce === handledNonce) return
    setHandledNonce(requestedRoom.nonce)
    openRoom(requestedRoom.id)
  }, [requestedRoom, handledNonce, openRoom])

  const changeSuspicion = useCallback((id: string, delta: number) => {
    const before = suspicionRef.current[id] ?? 0
    const after = Math.min(100, Math.max(0, before + delta))
    suspicionRef.current = { ...suspicionRef.current, [id]: after }
    setSuspicion(suspicionRef.current)
    if (after >= 100 && !bustedRef.current) {
      bustedRef.current = true
      const { schedule, end } = buildSpamSchedule(id)
      window.setTimeout(() => {
        callbacksRef.current.onSpamStart?.()
        schedule.forEach(({ item, at }) => {
          window.setTimeout(() => {
            const spam = { ...item, senderName: item.senderName.trim(), text: replaceUserName(item.text, owner) }
            const roomId = spam.senderId === 'group' ? 'staff' : spam.senderId
            deliver(roomId, [spam.text], { instant: true, badge: true, urgent: true })
            callbacksRef.current.onSpam?.(spam)
          }, at)
        })
        window.setTimeout(() => callbacksRef.current.onBusted?.(SUSPICION_100_GAME_OVER_TEXT), end)
      }, SPAM_START_DELAY_MS)
    }
    return after
  }, [deliver, owner])

  const countTurn = useCallback((id: string, complete = false) => {
    if (bustedRef.current) return
    const limit = turnLimit(id, dayRef.current)
    turnsRef.current = { ...turnsRef.current, [id]: complete ? limit : Math.min(limit, (turnsRef.current[id] ?? 0) + 1) }
    setTurns(turnsRef.current)
  }, [])

  const captureSnapshot = useCallback(() => {
    snapshotCallbackRef.current?.(cloneSnapshot({
      day: dayRef.current,
      suspicion: suspicionRef.current,
      flags: [...flagsRef.current],
      turns: turnsRef.current,
      previews: previewsRef.current,
      added: addedRef.current,
    }))
  }, [])

  useEffect(() => {
    captureSnapshot()
  }, [captureSnapshot])

  useEffect(() => {
    if (dayRef.current === day) return
    dayRef.current = day
    turnsRef.current = {}
    setTurns({})
    captureSnapshot()
    completedPreWorkRef.current = new Set()
    preWorkFiredRef.current = false
    completedScriptsRef.current = new Set()
    setCompletedScripts(new Set())
    dayCompleteFiredRef.current = false
    setHeldAt({})
    setStagesPlayed(0)
    setStageCue(0)
    interludeShownRef.current = new Set()
  }, [day])

  const [heldAt, setHeldAt] = useState<Record<string, string>>({})
  const [stagesPlayed, setStagesPlayed] = useState(0)
  const [stageCue, setStageCue] = useState(0)
  const stagedGroupId = Object.keys(groupScriptsForDay(day)).find((id) => groupScriptsForDay(day)[id].stages)
  const stagedGroup = stagedGroupId ? groupScriptsForDay(day)[stagedGroupId] : undefined
  const stages = stagedGroup?.stages ?? []
  const stagesSkipped = Boolean(stagedGroup?.skipIfFlags?.some((flag) => flagsRef.current.has(flag)))

  const holdNodeFor = (chatId: string) => {
    if (!stagedGroup || stagesSkipped) return null
    for (let index = stagesPlayed; index < stages.length; index += 1) {
      const node = stages[index].holdNodes[chatId]
      if (node) return node
    }
    return null
  }

  useEffect(() => {
    if (!stagedGroupId || !clockStarted || stageCue > stagesPlayed || stagesPlayed >= stages.length) return
    const manIds = Object.keys(scriptsForDay(day))
    if (stagesSkipped) {
      if (manIds.every((id) => completedScripts.has(id)) && !completedScripts.has(stagedGroupId)) handleScriptDone(stagedGroupId)
      return
    }
    const holds = stages[stagesPlayed].holdNodes
    const ready = manIds.every((id) => completedScripts.has(id) || !holds[id] || heldAt[id] === holds[id])
    if (!ready) return
    const stageIndex = stagesPlayed
    const interlude = stages[stageIndex].interlude
    const showInterlude = interludeCallbackRef.current
    if (!interlude || !showInterlude) {
      setStageCue(stageIndex + 1)
      return
    }
    if (interludeShownRef.current.has(stageIndex)) return
    interludeShownRef.current.add(stageIndex)
    showInterlude(interlude, () => setStageCue((current) => Math.max(current, stageIndex + 1)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heldAt, completedScripts, stagesPlayed, stageCue, clockStarted, day, stagedGroupId, stagesSkipped])

  const handleSync = useCallback((id: string, key: string) => {
    const answered = syncAnswersRef.current.get(key) ?? new Set<string>()
    answered.add(id)
    syncAnswersRef.current.set(key, answered)
    const required = [...syncMembers(dayRef.current, key), ...(SYNC_EXTERNAL_SOURCES[key] ?? [])]
    if (!required.every((member) => answered.has(member))) return
    setReadySyncs((current) => new Set(current).add(key))
  }, [])

  const handleDoomed = useCallback((id: string) => {
    doomedRef.current.add(id)
  }, [])

  const handleGameOver = useCallback((id: string, alert?: string) => {
    if (bustedRef.current) return
    finishedDoomRef.current.add(id)
    gameOverAlertRef.current ??= alert
    const waiting = [...doomedRef.current].some((member) => !finishedDoomRef.current.has(member))
    if (waiting) return
    bustedRef.current = true
    callbacksRef.current.onBusted?.(gameOverAlertRef.current)
  }, [])

  const handleScriptDone = useCallback((id: string) => {
    completedScriptsRef.current.add(id)
    setCompletedScripts(new Set(completedScriptsRef.current))
    if (dayCompleteFiredRef.current || bustedRef.current) return
    const ids = [...Object.keys(scriptsForDay(dayRef.current)), ...Object.keys(groupScriptsForDay(dayRef.current))]
    if (!ids.length || !ids.every((key) => completedScriptsRef.current.has(key))) return
    dayCompleteFiredRef.current = true
    callbacksRef.current.onDayComplete?.(suspicionRef.current)
  }, [])

  const handleGateDone = useCallback((id: string) => {
    completedPreWorkRef.current.add(id)
    if (preWorkFiredRef.current || bustedRef.current) return
    if (!preWorkIds(dayRef.current).every((key) => completedPreWorkRef.current.has(key))) return
    preWorkFiredRef.current = true
    preWorkCallbackRef.current?.()
  }, [])

  const handleCrossMessage = useCallback(
    ({ chat, texts, delayMs, delta, sync, setFlag }: CrossMessage) => {
      window.setTimeout(() => {
        if (bustedRef.current) return
        if (setFlag) flagsRef.current.add(setFlag)
        if (chat && texts.length) deliver(chat, texts, { badge: true })
        if (chat && delta) changeSuspicion(chat, delta)
        if (sync) handleSync(INSTA_SYNC_SOURCE, sync)
      }, delayMs)
    },
    [deliver, changeSuspicion, handleSync],
  )

  useEffect(() => {
    const onInstaComment = (event: Event) => handleCrossMessage((event as CustomEvent<CrossMessage>).detail)
    window.addEventListener(INSTA_CROSS_MESSAGE_EVENT, onInstaComment)
    return () => window.removeEventListener(INSTA_CROSS_MESSAGE_EVENT, onInstaComment)
  }, [handleCrossMessage])

  const handleIncoming = useCallback((id: string, text: string) => {
    setPreviews((current) => ({ ...current, [id]: text }))
    if (viewingRef.current === id) return
    setUnread((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
    callbacksRef.current.onIncoming?.(id, text)
  }, [])

  return (
    <section
      aria-label="카카오톡"
      aria-hidden={!open}
      inert={!open}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && !open) setRoomId(null)
      }}
      className={cn(
        'absolute inset-0 z-20 origin-[42%_30%] overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <ChatList chats={visibleChats} owner={owner} onOpen={openRoom} />
      {chats.map((chat) => {
        const current = roomId === chat.id
        const dayGroups = groupScriptsForDay(day)
        const groupIds = Object.keys(dayGroups)
        const isGroupRoom = groupIds.includes(chat.id)
        const groupsFinished = groupIds
          .filter((id) => !dayGroups[id].afterAllChats && !dayGroups[id].afterWorkEnd && !dayGroups[id].stages)
          .every((id) => completedScripts.has(id))
        const afterWorkGroupsFinished = groupIds
          .filter((id) => dayGroups[id].afterWorkEnd)
          .every((id) => completedScripts.has(id))
        const chatsFinished = Object.keys(scriptsForDay(day)).every((id) => completedScripts.has(id))
        const groupReady = isGroupRoom
          ? dayGroups[chat.id].afterAllChats
            ? chatsFinished
            : dayGroups[chat.id].afterWorkEnd
              ? workEnded
              : true
          : false
        const roomReady = isGroupRoom ? groupReady : groupsFinished
        const roomWorkEnded = isGroupRoom ? workEnded : workEnded && afterWorkGroupsFinished
        return (
          <div
            key={chat.id}
            aria-hidden={!current}
            inert={!current}
            className={cn(
              'absolute inset-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
              current ? 'translate-x-0 shadow-[-12px_0_30px_rgba(0,0,0,0.12)]' : 'translate-x-full',
            )}
          >
            <ChatRoom
              chat={chat}
              owner={owner}
              active={open && current}
              onBack={() => setRoomId(null)}
              inbox={inbox[chat.id] ?? []}
              suspicion={chat.id in suspicion ? suspicion[chat.id] : undefined}
              suspicionActive={startedRooms.has(chat.id)}
              onSuspicionChange={(delta) => changeSuspicion(chat.id, delta)}
              onIncoming={(text) => handleIncoming(chat.id, text)}
              onSent={(text) => setPreviews((prev) => ({ ...prev, [chat.id]: text }))}
              turns={turns[chat.id] ?? 0}
              onTurn={(complete) => countTurn(chat.id, complete)}
              clockStarted={clockStarted && roomReady}
              workEnded={roomWorkEnded}
              onGateDone={() => handleGateDone(chat.id)}
              onScriptDone={() => handleScriptDone(chat.id)}
              day={day}
              flags={flagsRef.current}
              onGameOver={(alert) => handleGameOver(chat.id, alert)}
              readySyncs={readySyncs}
              onSync={(key) => handleSync(chat.id, key)}
              onDoomed={() => handleDoomed(chat.id)}
              initialAdded={resume?.added[chat.id]}
              onAddedChange={(items) => {
                addedRef.current[chat.id] = items
              }}
              othersDone={Object.keys(scriptsForDay(day)).every((key) => key === chat.id || completedScripts.has(key))}
              holdNode={holdNodeFor(chat.id)}
              onHeld={(node) => setHeldAt((current) => ({ ...current, [chat.id]: node }))}
              stageCue={chat.id === stagedGroupId ? stageCue : 0}
              onStageDone={(index) => setStagesPlayed((current) => Math.max(current, index + 1))}
              startGate={(() => {
                const prev = startPredecessor(chat.id)
                return !prev || repliedChats.has(prev) || completedScripts.has(prev)
              })()}
              gatedStartMs={startPredecessor(chat.id) ? SEQUENTIAL_START_DELAY_MS : undefined}
              onReply={() => markReplied(chat.id)}
              onCrossMessage={handleCrossMessage}
            />
          </div>
        )
      })}
    </section>
  )
}
