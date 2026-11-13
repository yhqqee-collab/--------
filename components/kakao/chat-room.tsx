'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, Hash, ImageIcon, Menu, Plus, Search, Smile, X } from 'lucide-react'
import { NoticeBar } from './notice-bar'
import { cn } from '@/lib/utils'
import { PERSON_AVATARS } from '@/lib/template-config'
import { Avatar } from './avatar'
import type { Chat, ChatItem } from './chat-data'
import { personalizeText } from './replies'
import { ME_LINE_PREFIX, dayDivider, fillMetName, groupScriptsForDay, isActionText, isDoomNode, pauseDuration, replyFor, resolveNode, scriptsForDay, type Choice, type CrossMessage, type GroupChoice, type GroupLine } from './scripts'
import { getStage, STAGE_LABEL, type SuspicionStage } from './suspicion'
import { SuspicionAlert } from './suspicion-alert'

type Message = Extract<ChatItem, { type: 'msg' }>

export type Delivery = { id: number; texts: string[]; instant?: boolean; badge?: boolean; urgent?: boolean; sender?: string; time?: string }

type Batch = {
  texts: string[]
  sender?: string
  time?: string
  dueAt: number
  instant: boolean
  badge: boolean
  turn: number
  nudge?: boolean
  reply?: boolean
  enterNode?: string
  gateDone?: boolean
  dateLabel?: string
  gameOver?: boolean
  gameOverAlert?: string
  interludeShown?: boolean
}

const NO_SYNCS: ReadonlySet<string> = new Set()
const NO_FLAGS: ReadonlySet<string> = new Set()
const GAME_OVER_DELAY_MS = 2500

const ALERT_REPLY_DELAY_MS = 4000
const GATE_NO_REPLY_MS = 1200
/** 단톡방 선택으로 분기가 정해진 뒤 개인톡이 먼저 오기까지 */
const HELD_BRANCH_MIN_MS = 7000
/** 시스템 팝업을 닫은 뒤 다음 카톡이 오기까지 */
const AUTO_ADVANCE_DELAY_MS = 5000
/** 마지막 답장을 본 뒤 전환 팝업이 뜨기까지 최소 읽을 시간 */
const READ_TIME_MS = 2500

type ChatRoomProps = {
  chat: Chat
  owner: string
  active: boolean
  onBack: () => void
  inbox: Delivery[]
  suspicion?: number
  suspicionActive: boolean
  onSuspicionChange: (delta: number) => number
  onIncoming: (text: string) => void
  onSent: (text: string) => void
  turns?: number
  onTurn?: (complete: boolean) => void
  clockStarted?: boolean
  workEnded?: boolean
  onGateDone?: () => void
  onScriptDone?: () => void
  day?: number
  flags?: Set<string>
  onGameOver?: (alert?: string) => void
  othersDone?: boolean
  readySyncs?: ReadonlySet<string>
  onSync?: (key: string) => void
  onDoomed?: () => void
  initialAdded?: ChatItem[]
  onAddedChange?: (items: ChatItem[]) => void
  /** 스크립트 밖에서 띄우는 단일 답장 선택지 */
  forcedChoice?: string | null
  onForcedChoice?: () => void
  /** 이 노드의 카톡은 도착 직전에 대기시킵니다 (단톡방 단계 대화가 끝날 때까지) */
  holdNode?: string | null
  onHeld?: (node: string) => void
  /** 단톡방 stages 중 재생을 허락받은 단계 수 */
  stageCue?: number
  onStageDone?: (stage: number) => void
  /** false 면 첫 카톡 도착을 미룹니다 (앞 사람에게 답장할 때까지) */
  startGate?: boolean
  /** 지정하면 startGate 가 열린 뒤 이 시간(ms) 후 첫 카톡이 도착 */
  gatedStartMs?: number
  onReply?: () => void
  onCrossMessage?: (message: CrossMessage) => void
  onInterlude?: (text: string, done: () => void) => void
  /** 선택지가 setFlag 를 켰을 때 (폰 전체 연출용) */
  onFlag?: (flag: string) => void
}

const REPLY_DELAY_MIN_MS = 15000
const REPLY_DELAY_MAX_MS = 30000

const LINE_GAP_MIN_MS = 1000
const LINE_GAP_MAX_MS = 2000

function lineGap() {
  return LINE_GAP_MIN_MS + Math.random() * (LINE_GAP_MAX_MS - LINE_GAP_MIN_MS)
}

const INCOMING_GAP_MIN_MS = 2000
const INCOMING_GAP_MAX_MS = 5000

function incomingGap() {
  return INCOMING_GAP_MIN_MS + Math.random() * (INCOMING_GAP_MAX_MS - INCOMING_GAP_MIN_MS)
}

function randomReplyDelay() {
  return REPLY_DELAY_MIN_MS + Math.random() * (REPLY_DELAY_MAX_MS - REPLY_DELAY_MIN_MS)
}

const STAGE_COLOR: Record<SuspicionStage, string> = {
  calm: 'bg-[#4CAF7A]',
  uneasy: 'bg-[#F0A53A]',
  cold: 'bg-[#D9453B]',
}

function nowLabel() {
  const d = new Date()
  const h = d.getHours()
  const period = h < 12 ? '오전' : '오후'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${period} ${hour}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 이 시간(ms) 이상 대기한 뒤 오는 카톡은 새 묶음으로 분리 */
const LONG_PAUSE_MS = 3000

function sameGroup(a: ChatItem | undefined, b: Message) {
  return a?.type === 'msg' && a.from === b.from && a.time === b.time && a.sender === b.sender
}

function typingDuration(text: string) {
  return Math.min(1200 + text.length * 70, 4000)
}

export function ChatRoom({ chat, owner, active, onBack, inbox, suspicion, suspicionActive, onSuspicionChange, onIncoming, onSent, turns = 0, onTurn, clockStarted = false, workEnded = false, onGateDone, onScriptDone, day = 1, flags, onGameOver, othersDone = true, readySyncs = NO_SYNCS, onSync, onDoomed, initialAdded, onAddedChange, forcedChoice, onForcedChoice, holdNode = null, onHeld, stageCue = 0, onStageDone, startGate = true, gatedStartMs, onReply, onCrossMessage, onInterlude, onFlag }: ChatRoomProps) {
  const script = scriptsForDay(day)[chat.id]
  const groupScript = groupScriptsForDay(day)[chat.id]
  const [groupChoices, setGroupChoices] = useState<GroupChoice[] | null>(null)
  const [groupPicked, setGroupPicked] = useState<number | null>(null)
  const groupStartedRef = useRef(false)
  const waitSyncRef = useRef<{ key: string; next: string | null; delayMs: number } | null>(null)
  const [syncText, setSyncText] = useState<string | null>(null)
  const activeFlags = flags ?? NO_FLAGS
  const othersDoneRef = useRef(othersDone)
  othersDoneRef.current = othersDone
  const waitNextRef = useRef<{ id: string; delayMs: number } | null>(null)
  const fillChoice = (line: string) => personalizeText(fillMetName(line, activeFlags), owner)
  const delayedStart = script?.delayedStartMs !== undefined
  const [added, setAdded] = useState<ChatItem[]>(() => initialAdded ?? [])
  const addedChangeRef = useRef(onAddedChange)
  addedChangeRef.current = onAddedChange
  useEffect(() => {
    addedChangeRef.current?.(added)
  }, [added])
  const [nodeId, setNodeId] = useState<string | null>(delayedStart ? null : (script?.start ?? null))
  const [pendingPhase, setPendingPhase] = useState(delayedStart)
  const startedRef = useRef(false)
  const gatedNextRef = useRef<string | null>(null)
  const gatedWaitRef = useRef<{ sync?: string; waitOthers: boolean; delayMs: number } | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [typing, setTyping] = useState(false)
  const [note, setNote] = useState<number | null>(null)
  const [newBadge, setNewBadge] = useState(false)
  const [viewer, setViewer] = useState<string | null>(null)
  const [rosterOpen, setRosterOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const lastIsThem = (() => {
    const last = chat.items.at(-1)
    return last?.type === 'msg' && last.from === 'them'
  })()
  const awaitingRef = useRef(lastIsThem)
  const readAtRef = useRef<number | null>(null)
  const hasChoicesRef = useRef(false)
  const replyTurnRef = useRef(0)
  const handledInboxRef = useRef(0)
  const queueRef = useRef<Batch[]>([])
  // Bumped whenever the queue is reset so playback chains scheduled before the reset stop instead of double-playing.
  const queueEpochRef = useRef(0)
  const playingRef = useRef(false)
  const timersRef = useRef(new Set<number>())
  const noteTimerRef = useRef<number | undefined>(undefined)
  const badgeTimerRef = useRef<number | undefined>(undefined)
  const waitingRef = useRef(false)
  const pendingNodeRef = useRef<string | null>(null)
  const unreadRef = useRef(false)
  const lastSeenAtRef = useRef(0)
  const pendingReadRef = useRef<(() => void)[]>([])
  const chooseRef = useRef<(choice: Choice, index: number, nextDelayOverride?: number) => void>(() => {})

  const scriptDoneRef = useRef(false)
  const latest = useRef({ active, owner, onSuspicionChange, onIncoming, onGateDone, onScriptDone, onGameOver, onDoomed, onReply, onCrossMessage, onInterlude })
  latest.current = { active, owner, onSuspicionChange, onIncoming, onGateDone, onScriptDone, onGameOver, onDoomed, onReply, onCrossMessage, onInterlude }

  const hasSuspicion = suspicion !== undefined
  const items: ChatItem[] = [...chat.items, ...added]
  const itemsRef = useRef(items)
  itemsRef.current = items

  function schedule(ms: number, fn: () => void) {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id)
      fn()
    }, ms)
    timersRef.current.add(id)
  }

  /** 안 읽은 답장이 있으면 방에 들어올 때까지 기다린 뒤, 마지막 말풍선을 본 시점부터 READ_TIME_MS 후 실행 */
  function whenRead(fn: () => void) {
    if (unreadRef.current || !latest.current.active) {
      if (unreadRef.current) {
        pendingReadRef.current.push(fn)
        return
      }
    }
    schedule(Math.max(0, lastSeenAtRef.current + READ_TIME_MS - Date.now()), fn)
  }

  function showNote(delta: number) {
    setNote(delta)
    window.clearTimeout(noteTimerRef.current)
    noteTimerRef.current = window.setTimeout(() => setNote(null), 4000)
  }

  function vibrate() {
    try {
      navigator.vibrate?.([180, 90, 180])
    } catch {}
  }

  function finishReply() {
    if (!waitingRef.current) return
    waitingRef.current = false
    setNodeId(pendingNodeRef.current)
    setPicked(null)
    setWaiting(false)
  }

  /** 새 페이즈·긴 대기 뒤에 상대가 이어서 보내면 묶음을 나눠 프로필·이름이 다시 보이게 함 */
  function withBreak(prev: ChatItem[], split: boolean): ChatItem[] {
    if (!split) return prev
    const last = prev.length ? prev[prev.length - 1] : chat.items[chat.items.length - 1]
    return last?.type === 'msg' && last.from === 'them' ? [...prev, { type: 'break' }] : prev
  }

  function land(text: string, badge: boolean, nudge: boolean, sender?: string, time = nowLabel(), split = false) {
    setTyping(false)
    if (text.startsWith(ME_LINE_PREFIX)) {
      const mine = text.slice(ME_LINE_PREFIX.length)
      setAdded((prev) => [...prev, { type: 'msg', from: 'me', text: mine, time }])
      return
    }
    setAdded((prev) => [...withBreak(prev, split), { type: 'msg', from: 'them', text, time, ...(sender ? { sender } : {}) }])
    if (latest.current.active) lastSeenAtRef.current = Date.now()
    else unreadRef.current = true
    if (!nudge || readAtRef.current === null) {
      readAtRef.current = latest.current.active ? Date.now() : null
    }
    awaitingRef.current = true
    latest.current.onIncoming(sender ? `${sender}: ${text}` : text)
    if (badge && latest.current.active) {
      setNewBadge(true)
      window.clearTimeout(badgeTimerRef.current)
      badgeTimerRef.current = window.setTimeout(() => setNewBadge(false), 4000)
    }
  }

  function playLine(batch: Batch, index: number) {
    const epoch = queueEpochRef.current
    if (batch.turn !== replyTurnRef.current) {
      if (queueRef.current[0] === batch) queueRef.current.shift()
      schedule(0, () => playNext(epoch))
      return
    }
    const text = batch.texts[index]
    const pause = pauseDuration(text)
    const isLast = index === batch.texts.length - 1
    const finish = () => {
      if (batch.turn !== replyTurnRef.current || epoch !== queueEpochRef.current) return
      if (index === 0 && batch.dateLabel) {
        const label = batch.dateLabel
        setAdded((prev) => [...prev, { type: 'date', label }])
      }
      if (pause === null) {
        const previousPause = index > 0 ? pauseDuration(batch.texts[index - 1]) : null
        const split = (index === 0 && !batch.reply) || (previousPause !== null && previousPause >= LONG_PAUSE_MS)
        land(text, batch.badge && index === 0, Boolean(batch.nudge), batch.sender, batch.time, split)
      }
      if (index === 0 && batch.enterNode) vibrate()
      if (!isLast) return schedule(batch.instant ? 300 : 0, () => playLine(batch, index + 1))
      if (batch.reply) finishReply()
      const autoNode = batch.enterNode ? script?.nodes[batch.enterNode] : undefined
      if (batch.enterNode && autoNode?.autoAdvance && autoNode.choices[0]) {
        const autoChoice = autoNode.choices[0]
        schedule(0, () => chooseRef.current(autoChoice, 0, AUTO_ADVANCE_DELAY_MS))
      } else if (batch.enterNode) {
        setNodeId(batch.enterNode)
        setPendingPhase(false)
      }
      if (batch.gateDone) whenRead(() => latest.current.onGateDone?.())
      if (batch.gameOver) schedule(GAME_OVER_DELAY_MS, () => latest.current.onGameOver?.(batch.gameOverAlert))
      const enteredNode = batch.enterNode ? script?.nodes[batch.enterNode] : undefined
      if (enteredNode?.gameOver) schedule(GAME_OVER_DELAY_MS, () => latest.current.onGameOver?.(enteredNode.gameOverAlert))
      queueRef.current.shift()
      schedule(300, () => playNext(epoch))
    }

    if (batch.instant) return finish()

    if (pause !== null) {
      setTyping(false)
      schedule(pause, finish)
      return
    }

    if (index > 0) {
      const nextIsMine = text.startsWith(ME_LINE_PREFIX)
      if (latest.current.active && !nextIsMine) setTyping(true)
      schedule(nextIsMine ? lineGap() : incomingGap(), finish)
      return
    }

    if (!latest.current.active) return finish()

    const wait = index === 0 ? Math.max(0, batch.dueAt - Date.now()) : 0
    const typingMs = batch.reply && wait > 0 ? wait : Math.min(wait || Infinity, typingDuration(text))
    schedule(wait === 0 ? 0 : wait - typingMs, () => {
      if (!latest.current.active) return finish()
      setTyping(true)
      schedule(typingMs, finish)
    })
  }

  function playNext(epoch = queueEpochRef.current) {
    if (epoch !== queueEpochRef.current) return
    const batch = queueRef.current[0]
    if (!batch) {
      playingRef.current = false
      return
    }
    playingRef.current = true
    const interlude = batch.enterNode && !batch.interludeShown ? script?.nodes[batch.enterNode]?.interlude : undefined
    if (interlude) {
      const stillCurrent = () => epoch === queueEpochRef.current && queueRef.current[0] === batch
      schedule(Math.max(0, batch.dueAt - Date.now()), () =>
        whenRead(() => {
          if (!stillCurrent()) return
          const resume = () => {
            if (!stillCurrent()) return
            queueRef.current[0] = { ...batch, interludeShown: true, dueAt: Date.now() + 400 }
            playNext(epoch)
          }
          const show = latest.current.onInterlude
          if (show) show(interlude, resume)
          else resume()
        }),
      )
      return
    }
    if (batch.instant || !latest.current.active) {
      schedule(Math.max(0, batch.dueAt - Date.now()), () => playLine(batch, 0))
      return
    }
    playLine(batch, 0)
  }

  const holdNodeRef = useRef(holdNode)
  holdNodeRef.current = holdNode
  const heldBatchRef = useRef<{ batch: Batch; remainingMs: number } | null>(null)
  const heldCallbackRef = useRef(onHeld)
  heldCallbackRef.current = onHeld

  function enqueue(batch: Batch) {
    if (batch.enterNode && batch.enterNode === holdNodeRef.current) {
      heldBatchRef.current = { batch, remainingMs: Math.max(0, batch.dueAt - Date.now()) }
      heldCallbackRef.current?.(batch.enterNode)
      return
    }
    queueRef.current.push(batch)
    if (!playingRef.current) playNext()
  }

  useEffect(() => {
    const held = heldBatchRef.current
    if (!held || held.batch.enterNode === holdNode) return
    heldBatchRef.current = null
    const heldId = held.batch.enterNode
    // 단톡방 선택으로 플래그가 정해진 뒤에 분기 노드를 다시 판정
    if (script && heldId && script.nodes[heldId]?.branch) {
      const resolved = resolveNode(script, heldId, activeFlags)
      const node = resolved ? script.nodes[resolved] : undefined
      if (!resolved || !node) {
        setPendingPhase(false)
        if (!scriptDoneRef.current) {
          scriptDoneRef.current = true
          latest.current.onScriptDone?.()
        }
        return
      }
      enqueue({
        ...held.batch,
        texts: node.lines.map((line) => personalizeText(line, latest.current.owner)),
        enterNode: resolved,
        dueAt: Date.now() + Math.max(held.remainingMs, HELD_BRANCH_MIN_MS),
        turn: replyTurnRef.current,
      })
      return
    }
    enqueue({ ...held.batch, dueAt: Date.now() + held.remainingMs, turn: replyTurnRef.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdNode])

  useEffect(() => {
    const fresh = inbox.slice(handledInboxRef.current)
    if (!fresh.length) return
    handledInboxRef.current = inbox.length
    fresh.forEach((delivery) => {
      if (delivery.urgent) {
        replyTurnRef.current += 1
        timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current.clear()
      queueRef.current = []
      queueEpochRef.current += 1
      playingRef.current = false
        setTyping(false)
        finishReply()
      }
      enqueue({ texts: delivery.texts, sender: delivery.sender, time: delivery.time, dueAt: Date.now(), instant: Boolean(delivery.instant), badge: Boolean(delivery.badge), turn: replyTurnRef.current })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox.length])

  const dayRef = useRef(day)
  useEffect(() => {
    if (dayRef.current === day) return
    dayRef.current = day
    startedRef.current = false
    gatedNextRef.current = null
    gatedWaitRef.current = null
    waitNextRef.current = null
    waitSyncRef.current = null
    setSyncText(null)
    scriptDoneRef.current = false
    groupStartedRef.current = false
    setGroupChoices(null)
    setGroupPicked(null)
    setNodeId(null)
    setPendingPhase(Boolean(script))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  function playGroupLines(lines: GroupLine[], onDone: () => void, dateLabel?: string) {
    let offset = 0
    lines.forEach((line, index) => {
      offset += line.delayMs
      schedule(offset, () => {
        const text = personalizeText(line.text, latest.current.owner)
        if (index === 0 && dateLabel) setAdded((prev) => [...prev, { type: 'date', label: dateLabel }])
        setTyping(false)
        const count = line.unread
        const split = index === 0 || line.delayMs >= LONG_PAUSE_MS
        setAdded((prev) => {
          const base = withBreak(prev, split)
          const lowered =
            count === undefined
              ? base
              : base.map((item) =>
                  item.type === 'msg' && typeof item.unread === 'number' && item.unread > count
                    ? { ...item, unread: count }
                    : item,
                )
          return [...lowered, { type: 'msg', from: 'them', sender: line.sender, text, time: nowLabel(), unread: count, images: line.images }]
        })
        latest.current.onIncoming(`${line.sender}: ${line.images ? '사진을 보냈습니다.' : text}`)
        vibrate()
        if (latest.current.active) {
          setNewBadge(true)
          window.clearTimeout(badgeTimerRef.current)
          badgeTimerRef.current = window.setTimeout(() => setNewBadge(false), 4000)
        }
        if (index === lines.length - 1) onDone()
      })
    })
    if (!lines.length) onDone()
  }

  useEffect(() => {
    if (!clockStarted || !groupScript || groupScript.stages || groupStartedRef.current) return
    groupStartedRef.current = true
    schedule(groupScript.startDelayMs, () => {
      playGroupLines(
        groupScript.messages,
        () => {
          if (groupScript.choices.length) setGroupChoices(groupScript.choices)
          else schedule(2500, () => latest.current.onScriptDone?.())
        },
        dayDivider(dayRef.current),
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockStarted, day])

  const stageChoiceRef = useRef<number | null>(null)
  const stagesPlayedRef = useRef(0)
  const stageDoneRef = useRef(onStageDone)
  stageDoneRef.current = onStageDone
  useEffect(() => {
    stagesPlayedRef.current = 0
  }, [day])
  useEffect(() => {
    const stages = groupScript?.stages
    if (!stages || stageCue <= stagesPlayedRef.current || stageCue > stages.length) return
    const index = stageCue - 1
    stagesPlayedRef.current = stageCue
    schedule(index === 0 ? groupScript.startDelayMs : 0, () =>
      playGroupLines(
        stages[index].messages,
        () => {
          const stageChoices = stages[index].choices
          if (stageChoices?.length) {
            stageChoiceRef.current = index
            setGroupChoices(stageChoices)
            return
          }
          stageDoneRef.current?.(index)
          if (index === stages.length - 1) schedule(2500, () => latest.current.onScriptDone?.())
        },
        index === 0 ? dayDivider(dayRef.current) : undefined,
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageCue])

  function chooseGroup(choice: GroupChoice, index: number) {
    if (groupPicked !== null) return
    setGroupPicked(index)
    setNewBadge(false)
    if (choice.setFlag) {
      flags?.add(choice.setFlag)
      onFlag?.(choice.setFlag)
    }
    const text = personalizeText(choice.text, owner)
    setAdded((prev) => [...prev, { type: 'msg', from: 'me', text, time: nowLabel() }])
    onSent(text)
    const stageIndex = stageChoiceRef.current
    stageChoiceRef.current = null
    playGroupLines(choice.reply, () => {
      setGroupChoices(null)
      setGroupPicked(null)
      if (stageIndex !== null) {
        stageDoneRef.current?.(stageIndex)
        if (stageIndex !== (groupScript?.stages?.length ?? 0) - 1) return
      }
      schedule(2500, () => latest.current.onScriptDone?.())
    })
  }

  useEffect(() => {
    if (!clockStarted || !startGate || !script || script.delayedStartMs === undefined || startedRef.current) return
    startedRef.current = true
    const startNode = script.nodes[script.start]
    if (!startNode) return
    schedule(gatedStartMs ?? script.delayedStartMs, () => {
      enqueue({
        texts: startNode.lines.map((line) => personalizeText(line, latest.current.owner)),
        dueAt: Date.now(),
        instant: false,
        badge: true,
        turn: replyTurnRef.current,
        enterNode: script.start,
        dateLabel: dayDivider(dayRef.current),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockStarted, startGate])

  useEffect(() => {
    const gated = gatedNextRef.current
    if (!workEnded || !script || !gated) return
    gatedNextRef.current = null
    const wait = gatedWaitRef.current
    gatedWaitRef.current = null
    // 근무 후 첫 카톡이 다른 이벤트(인스타 댓글 등)를 기다려야 하는 경우
    if (wait?.sync && !readySyncs.has(wait.sync)) {
      waitSyncRef.current = { key: wait.sync, next: gated, delayMs: wait.delayMs }
      return
    }
    const next = resolveNode(script, gated, activeFlags)
    const node = next ? script.nodes[next] : undefined
    if (!node || !next) {
      setPendingPhase(false)
      return
    }
    if (wait?.waitOthers && !othersDoneRef.current) {
      waitNextRef.current = { id: next, delayMs: wait.delayMs }
      return
    }
    enqueue({
      texts: node.lines.map((line) => personalizeText(line, latest.current.owner)),
      dueAt: Date.now() + (wait ? wait.delayMs : (script.workEndDelayMs ?? 5000)),
      instant: false,
      badge: true,
      turn: replyTurnRef.current,
      enterNode: next,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workEnded])

  useEffect(() => {
    const waitingNext = waitNextRef.current
    if (!othersDone || !script || !waitingNext) return
    waitNextRef.current = null
    // 다른 캐릭터와의 약속 결과(플래그)가 이제 확정됐으니 다시 분기 판정
    const nextId = resolveNode(script, waitingNext.id, activeFlags)
    const node = nextId ? script.nodes[nextId] : undefined
    if (!nextId || !node) {
      setPendingPhase(false)
      if (!scriptDoneRef.current) {
        scriptDoneRef.current = true
        latest.current.onScriptDone?.()
      }
      return
    }
    enqueue({
      texts: node.lines.map((line) => personalizeText(line, latest.current.owner)),
      dueAt: Date.now() + waitingNext.delayMs,
      instant: false,
      badge: true,
      turn: replyTurnRef.current,
      enterNode: nextId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [othersDone])

  useEffect(() => {
    const pending = waitSyncRef.current
    if (!script || !pending || !readySyncs.has(pending.key)) return
    waitSyncRef.current = null
    setSyncText(null)
    const next = resolveNode(script, pending.next, activeFlags)
    const node = next ? script.nodes[next] : undefined
    if (!node || !next) {
      setPendingPhase(false)
      return
    }
    if (isDoomNode(node)) latest.current.onDoomed?.()
    enqueue({
      texts: node.lines.map((line) => personalizeText(line, latest.current.owner)),
      dueAt: Date.now() + pending.delayMs,
      instant: false,
      badge: true,
      turn: replyTurnRef.current,
      enterNode: next,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readySyncs])

  useEffect(() => {
    if (active && awaitingRef.current && readAtRef.current === null) readAtRef.current = Date.now()
    if (!active || !unreadRef.current) return
    unreadRef.current = false
    lastSeenAtRef.current = Date.now()
    const pending = pendingReadRef.current
    pendingReadRef.current = []
    pending.forEach((fn) => schedule(READ_TIME_MS, fn))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(noteTimerRef.current)
      window.clearTimeout(badgeTimerRef.current)
    }
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [added.length, typing, active, waiting])

  function choose(rawChoice: Choice, index: number, nextDelayOverride?: number) {
    const choice = nextDelayOverride !== undefined && rawChoice.nextDelayMs !== undefined ? { ...rawChoice, nextDelayMs: nextDelayOverride } : rawChoice
    if (waitingRef.current) return
    waitingRef.current = true
    latest.current.onReply?.()
    if (choice.setFlag) {
      flags?.add(choice.setFlag)
      onFlag?.(choice.setFlag)
    }
    if (choice.crossMessage) latest.current.onCrossMessage?.(choice.crossMessage)
    const deferBranch = Boolean(choice.next && choice.next === holdNodeRef.current && script?.nodes[choice.next]?.branch)
    const nextId = script && !deferBranch ? resolveNode(script, choice.next, activeFlags) : choice.next
    pendingNodeRef.current = nextId
    const says = choice.says.map(fillChoice)
    const time = nowLabel()
    let sendOffset = 0
    says.forEach((text, i) => {
      const send = () => {
        if (isActionText(text)) return
        setAdded((prev) => [...prev, { type: 'msg', from: 'me', text, time }])
        if (i === says.length - 1) onSent(text)
      }
      if (i === 0) return send()
      sendOffset += lineGap()
      schedule(sendOffset, send)
    })
    setNewBadge(false)
    setPicked(index)
    setWaiting(true)
    const reachesEnd = !deferBranch && (!nextId || !script?.nodes[nextId]?.choices.length)

    const judging = hasSuspicion && suspicionActive
    let value = suspicion ?? 0
    if (judging) {
      const delta = choice.delta
      if (delta !== 0) {
        value = onSuspicionChange(delta)
        showNote(delta)
      }
      onTurn?.(reachesEnd)
    }

    awaitingRef.current = false
    readAtRef.current = null
    replyTurnRef.current += 1
    queueRef.current = []
    queueEpochRef.current += 1
    playingRef.current = false
    setTyping(false)

    if (choice.nextDelayMs !== undefined) {
      const replyAt = Date.now() + sendOffset
      const turn = replyTurnRef.current
      const alert = (choice.reply ?? []).map((line) => personalizeText(line, owner))
      const nextNode = nextId ? script?.nodes[nextId] : undefined
      const gatedNext = choice.gate && choice.next && script?.nodes[choice.next] ? choice.next : null
      waitingRef.current = false
      setWaiting(false)
      setPicked(null)
      setNodeId(null)
      setPendingPhase(choice.gate ? Boolean(gatedNext) : Boolean(nextNode))
      const replyDelay = choice.replyDelayMs ?? ALERT_REPLY_DELAY_MS
      if (alert.length) {
        enqueue({ texts: alert, dueAt: replyAt + replyDelay, instant: false, badge: false, turn, gateDone: choice.gate, gameOver: choice.gameOver, gameOverAlert: choice.gameOverAlert })
      } else {
        if (choice.gate) schedule(sendOffset + GATE_NO_REPLY_MS, () => latest.current.onGateDone?.())
        if (choice.gameOver) schedule(sendOffset + GAME_OVER_DELAY_MS, () => latest.current.onGameOver?.(choice.gameOverAlert))
      }
      if (choice.gate) {
        gatedNextRef.current = gatedNext
        gatedWaitRef.current =
          choice.sync || choice.waitOthers ? { sync: choice.sync, waitOthers: Boolean(choice.waitOthers), delayMs: choice.nextDelayMs } : null
        if (choice.sync) onSync?.(choice.sync)
        return
      }
      if (choice.sync) {
        const key = choice.sync
        waitSyncRef.current = { key, next: choice.next, delayMs: choice.nextDelayMs }
        setPendingPhase(true)
        if (choice.waitText) schedule(sendOffset + replyDelay + 1500, () => {
          if (waitSyncRef.current?.key === key) setSyncText(choice.waitText ?? null)
        })
        onSync?.(key)
        return
      }
      if (nextNode && isDoomNode(nextNode)) latest.current.onDoomed?.()
      if (nextNode && nextId && choice.waitOthers && !othersDoneRef.current) {
        waitNextRef.current = { id: nextId, delayMs: choice.nextDelayMs }
        return
      }
      if (nextNode && nextId) {
        enqueue({
          texts: nextNode.lines.map((line) => personalizeText(line, owner)),
          dueAt: replyAt + choice.nextDelayMs,
          instant: false,
          badge: true,
          turn,
          enterNode: nextId,
        })
      }
      return
    }

    const texts = script ? replyFor(choice, getStage(value), script).map((line) => personalizeText(line, owner)) : []
    if (!texts.length) {
      finishReply()
      return
    }
    enqueue({ texts, dueAt: Date.now() + sendOffset + randomReplyDelay(), instant: false, badge: false, turn: replyTurnRef.current, reply: true })
  }
  chooseRef.current = choose

  const lastItem = items.at(-1)
  const typingContinues = lastItem?.type === 'msg' && lastItem.from === 'them'
  const currentNode = nodeId ? script?.nodes[nodeId] : undefined
  const choices = currentNode?.choices.length ? currentNode.choices : undefined
  hasChoicesRef.current = Boolean(choices)
  const finished = Boolean(script) && !choices && !pendingPhase

  useEffect(() => {
    if (!finished || typing || waiting || scriptDoneRef.current || queueRef.current.length > 0) return
    const id = window.setTimeout(() => {
      if (scriptDoneRef.current || queueRef.current.length > 0) return
      scriptDoneRef.current = true
      latest.current.onScriptDone?.()
    }, 2500)
    return () => window.clearTimeout(id)
  }, [finished, typing, waiting, added.length])

  return (
    <div className="relative flex h-full flex-col bg-[#B2C7DA] text-[#191919]">
      <SuspicionAlert suspicion={suspicion} active={active} />
      {viewer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="사진 보기"
          className="absolute inset-0 z-50 flex flex-col bg-black"
        >
          <div className="flex justify-end px-3 pb-2 pt-[56px]">
            <button
              type="button"
              onClick={() => setViewer(null)}
              className="flex size-9 items-center justify-center rounded-full text-white transition-opacity active:opacity-50"
              aria-label="닫기"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <div className="flex flex-1 items-center overflow-auto">
            <Image src={viewer} alt="근무표 사진" width={2370} height={1168} className="h-auto w-full" />
          </div>
        </div>
      )}
      <header className="flex items-center gap-1 bg-[#B2C7DA]/90 px-2 pb-2 pt-[56px] backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-[16px] transition-opacity active:opacity-50"
        >
          <ChevronLeft className="size-[28px]" strokeWidth={1.8} aria-hidden />
          <span>뒤로</span>
        </button>
        <h2 className="flex min-w-0 flex-1 justify-center gap-1 text-center text-[16px] font-semibold tracking-[-0.01em]">
          <span className="truncate">{chat.name}</span>
          {chat.members && <span className="shrink-0 font-normal text-[#3c4a57]">{`(${chat.members})`}</span>}
        </h2>
        <div className="flex items-center gap-3 pr-2">
          <Search className="size-[21px]" strokeWidth={1.9} aria-label="대화 검색" />
          {chat.roster ? (
            <button
              type="button"
              onClick={() => setRosterOpen(true)}
              className="flex items-center transition-opacity active:opacity-50"
              aria-label="대화상대 목록 보기"
              aria-expanded={rosterOpen}
            >
              <Menu className="size-[22px]" strokeWidth={1.9} aria-hidden />
            </button>
          ) : (
            <Menu className="size-[22px]" strokeWidth={1.9} aria-label="메뉴" />
          )}
        </div>
      </header>

      {chat.notice && <NoticeBar notice={chat.notice} />}

      {chat.roster && (
        <div className={cn('absolute inset-0 z-40', rosterOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
          <button
            type="button"
            tabIndex={rosterOpen ? 0 : -1}
            aria-label="대화상대 목록 닫기"
            onClick={() => setRosterOpen(false)}
            className={cn('absolute inset-0 bg-black/40 transition-opacity duration-300', rosterOpen ? 'opacity-100' : 'opacity-0')}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="대화상대 목록"
            aria-hidden={!rosterOpen}
            className={cn(
              'absolute inset-y-0 right-0 flex w-[78%] flex-col bg-white shadow-xl transition-transform duration-300 ease-out',
              rosterOpen ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] px-4 pb-3 pt-[60px]">
              <h3 className="text-[16px] font-semibold">
                대화상대 <span className="font-normal text-[#8A8A8A]">{chat.roster.length}</span>
              </h3>
              <button
                type="button"
                tabIndex={rosterOpen ? 0 : -1}
                onClick={() => setRosterOpen(false)}
                className="flex size-8 items-center justify-center rounded-full transition-opacity active:opacity-50"
                aria-label="닫기"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-4 py-2 [scrollbar-width:none]">
              {chat.roster.map((member) => {
                const isMe = member === '나'
                const label = isMe ? owner || '여주' : member
                return (
                  <li key={member} className="flex items-center gap-3 py-[9px]">
                    <Avatar src={isMe ? undefined : PERSON_AVATARS[member]} name={label} size={40} />
                    <span className="truncate text-[15px]">{label}</span>
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-[#F2F2F2] px-[7px] py-[1px] text-[11px] font-medium text-[#555555]">
                        나
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      )}

      {hasSuspicion && (
        <div className="bg-[#B2C7DA]/90 px-4 pb-2" role="status" aria-label={`의심도 ${suspicion}퍼센트, ${STAGE_LABEL[getStage(suspicion)]}`}>
          <div className="flex items-center justify-between text-[11px] font-medium text-[#3c4a57]">
            <span>의심도 · {STAGE_LABEL[getStage(suspicion)]}</span>
            <span className="tabular-nums">{`${suspicion}%`}</span>
          </div>
          <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-white/50">
            <div
              className={cn('h-full rounded-full transition-all duration-700 ease-out', STAGE_COLOR[getStage(suspicion)])}
              style={{ width: `${suspicion}%` }}
            />
          </div>
          {note !== null && (
            <p className={cn('mt-1 text-[11px] font-semibold tabular-nums', note > 0 ? 'text-[#B3261E]' : 'text-[#2E7D4F]')}>
              {`[의심도 ${note > 0 ? '+' : ''}${note}]`}
            </p>
          )}
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-y-auto px-3 pb-3 [scrollbar-width:none]">
          {items.map((item, i) => {
            if (item.type === 'date') {
              return (
                <div key={i} className="flex justify-center pb-3 pt-4">
                  <span className="rounded-full bg-black/[0.13] px-3 py-[4px] text-[11.5px] text-white">
                    {item.label}
                  </span>
                </div>
              )
            }
            if (item.type === 'break') return <div key={i} aria-hidden className="h-1.5" />

            const first = !sameGroup(items[i - 1], item)
            const next = items[i + 1]
            const last = !(next?.type === 'msg' && sameGroup(item, next))
            const mine = item.from === 'me'
            const senderName = item.sender ?? chat.name
            const senderAvatar = item.sender ? PERSON_AVATARS[item.sender] : chat.avatar

            return (
              <div
                key={i}
                className={cn('flex items-start gap-2', mine ? 'justify-end' : 'justify-start', first ? 'mt-[9px]' : 'mt-[4px]')}
              >
                {!mine && (
                  <div className="w-[38px] shrink-0">
                    {first && <Avatar src={senderAvatar} name={senderName} size={38} />}
                  </div>
                )}
                <div className={cn('flex min-w-0 flex-col', mine ? 'items-end' : 'items-start')}>
                  {!mine && first && <span className="mb-[4px] text-[12px] text-[#3c4a57]">{senderName}</span>}
                  <div className={cn('flex items-end gap-[5px]', mine && 'flex-row-reverse')}>
                    {item.images?.length ? (
                      <div className="grid w-[220px] grid-cols-2 gap-[2px] overflow-hidden rounded-[12px] bg-white">
                        {item.images.map((src, index) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => setViewer(src)}
                            className="aspect-[3/4] overflow-hidden transition-opacity active:opacity-80"
                            aria-label={`${senderName}님이 보낸 사진 ${index + 1} 크게 보기`}
                          >
                            <Image src={src} alt="" width={1658} height={2210} className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    ) : typeof item.image === 'string' ? (
                      <button
                        type="button"
                        onClick={() => setViewer(item.image as string)}
                        className="overflow-hidden rounded-[12px] bg-white transition-opacity active:opacity-80"
                        aria-label={`${senderName}님이 보낸 사진 크게 보기`}
                      >
                        <Image
                          src={item.image}
                          alt=""
                          width={2370}
                          height={1168}
                          className="h-auto w-[220px]"
                        />
                      </button>
                    ) : item.image ? (
                      <div
                        role="img"
                        aria-label={`${senderName}님이 보낸 사진`}
                        className="flex aspect-[4/5] w-[180px] items-center justify-center rounded-[12px] bg-[#D9DDE1]"
                      >
                        <ImageIcon className="size-[28px] text-[#A3ABB3]" strokeWidth={1.6} aria-hidden />
                      </div>
                    ) : (
                    <p
                      className={cn(
                        'relative max-w-[232px] whitespace-pre-wrap break-words rounded-[15px] px-[11px] py-[7px] text-[14.5px] leading-[1.38] tracking-[-0.01em]',
                        mine ? 'bg-[#FEE500]' : 'bg-white',
                        first && (mine ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'),
                      )}
                    >
                      {item.text}
                    </p>
                    )}
                    {Boolean(item.unread) && (
                      <div className={cn('flex shrink-0 flex-col gap-[2px] self-end pb-[1px]', mine ? 'items-end' : 'items-start')}>
                        <span
                          className="text-[10.5px] font-bold leading-none text-[#E6B800]"
                          aria-label={`읽지 않은 사람 ${typeof item.unread === 'number' ? item.unread : 1}명`}
                        >
                          {typeof item.unread === 'number' ? item.unread : 1}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {typing && (
            <div className="mt-[9px] flex items-start gap-2" role="status" aria-label={`${chat.name} 입력 중`}>
              <div className="w-[38px] shrink-0">{!typingContinues && <Avatar src={chat.avatar} name={chat.name} size={38} />}</div>
              <div className="flex flex-col items-start">
                {!typingContinues && <span className="mb-[4px] text-[12px] text-[#3c4a57]">{chat.name}</span>}
                <div className="flex items-center gap-[4px] rounded-[15px] bg-white px-[14px] py-[13px]">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="size-[6px] animate-bounce rounded-full bg-[#9aa3ab]"
                      style={{ animationDelay: `${dot * 150}ms`, animationDuration: '900ms' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {newBadge && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center" role="status">
            <span className="flex items-center gap-[6px] rounded-full bg-[#FA5A3C]/60 px-3 py-[6px] text-[12.5px] font-semibold text-white shadow-lg backdrop-blur-sm">
              <span className="size-[7px] rounded-full bg-white" aria-hidden />
              새 메시지 도착
            </span>
          </div>
        )}
      </div>

      <div className="bg-white px-3 pb-[28px] pt-[10px]">
        {syncText && (
          <p className="mb-[8px] text-center text-[12px] text-[#6b7680]" role="status" aria-live="polite">
            {syncText}
          </p>
        )}
        {waiting && (
          <div className="mb-[8px] flex items-center gap-[8px] text-[12px] text-[#6b7680]" role="status" aria-live="polite">
            <span className="flex items-center gap-[3px]" aria-hidden>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-[5px] animate-pulse rounded-full bg-[#9aa3ab]"
                  style={{ animationDelay: `${dot * 200}ms`, animationDuration: '1s' }}
                />
              ))}
            </span>
            <span>{`${chat.name} 님이 입력 중입니다...`}</span>
          </div>
        )}
        {groupChoices ? (
          <fieldset className="flex flex-col gap-[7px]" disabled={groupPicked !== null}>
            <legend className="mb-[7px] text-[11.5px] font-medium text-[#8a8a8a]">답장 선택</legend>
            {groupChoices.map((choice, index) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => chooseGroup(choice, index)}
                disabled={groupPicked !== null}
                aria-pressed={groupPicked === index}
                className={cn(
                  'w-full rounded-[14px] border border-[#E5E5E5] bg-[#F7F7F7] px-[13px] py-[9px] text-left text-[14px] leading-[1.38] tracking-[-0.01em] transition-colors enabled:hover:border-[#FEE500] enabled:hover:bg-[#FFFBD6] enabled:active:scale-[0.99] enabled:active:bg-[#FEE500] disabled:cursor-not-allowed',
                  groupPicked !== null && (groupPicked === index ? 'border-[#FEE500] bg-[#FFFBD6] text-[#191919]' : 'opacity-45'),
                )}
              >
                {personalizeText(choice.text, owner)}
              </button>
            ))}
          </fieldset>
        ) : forcedChoice && !choices ? (
          <fieldset className="flex flex-col gap-[7px]">
            <legend className="mb-[7px] text-[11.5px] font-medium text-[#8a8a8a]">답장 선택</legend>
            <button
              type="button"
              onClick={() => {
                setNewBadge(false)
                onForcedChoice?.()
              }}
              className="w-full rounded-[14px] border border-[#E5E5E5] bg-[#F7F7F7] px-[13px] py-[9px] text-left text-[14px] leading-[1.38] tracking-[-0.01em] transition-colors hover:border-[#FEE500] hover:bg-[#FFFBD6] active:scale-[0.99] active:bg-[#FEE500]"
            >
              {forcedChoice}
            </button>
          </fieldset>
        ) : choices ? (
          <fieldset className="flex flex-col gap-[7px]" disabled={waiting}>
            <legend className="mb-[7px] text-[11.5px] font-medium text-[#8a8a8a]">답장 선택</legend>
            {choices.map((choice, index) => (
              <button
                key={`${nodeId}-${index}`}
                type="button"
                onClick={() => choose(choice, index)}
                disabled={waiting}
                aria-pressed={picked === index}
                className={cn(
                  'w-full rounded-[14px] border border-[#E5E5E5] bg-[#F7F7F7] px-[13px] py-[9px] text-left text-[14px] leading-[1.38] tracking-[-0.01em] transition-colors enabled:hover:border-[#FEE500] enabled:hover:bg-[#FFFBD6] enabled:active:scale-[0.99] enabled:active:bg-[#FEE500] disabled:cursor-not-allowed',
                  waiting && (picked === index ? 'border-[#FEE500] bg-[#FFFBD6] text-[#191919]' : 'opacity-45'),
                )}
              >
                {choice.says.map(fillChoice).join(' ')}
              </button>
            ))}
          </fieldset>
        ) : (
          <div className="flex items-center gap-[10px]">
            <Plus className="size-[24px] shrink-0 text-[#8A8A8A]" strokeWidth={1.7} aria-hidden />
            <label className="sr-only" htmlFor={`kakao-input-${chat.id}`}>
              메시지 입력
            </label>
            <input
              id={`kakao-input-${chat.id}`}
              type="text"
              disabled
              value=""
              readOnly
              className="h-[36px] min-w-0 flex-1 cursor-not-allowed rounded-full bg-[#F3F3F3] px-[14px] text-[14px] outline-none"
            />
            <Smile className="size-[23px] shrink-0 text-[#8A8A8A]" strokeWidth={1.7} aria-hidden />
            <Hash className="size-[22px] shrink-0 text-[#8A8A8A]" strokeWidth={1.7} aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}
