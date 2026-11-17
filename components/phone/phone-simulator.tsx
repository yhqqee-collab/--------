'use client'

// 게임 시간 관리자(자동 저장·복원용). 다른 게임 모듈보다 먼저 불러와야 합니다.
import '@/lib/session-clock'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Moon } from 'lucide-react'
import type { DaySnapshot } from '@/components/kakao/snapshot'
import { CalendarApp } from '@/components/calendar/calendar-app'
import { todayFor } from '@/components/calendar/calendar-data'
import { InstagramApp } from '@/components/instagram/instagram-app'
import { StoryViewer } from '@/components/instagram/story-viewer'
import { DAEYOUNG_ID, DAEYOUNG_TAG_DAY, NOTIFICATION_COMMENT, YUSHI_ID } from '@/components/instagram/instagram-data'
import { CHAT_DISPLAY_NAMES } from '@/components/kakao/chat-data'
import { KakaoApp } from '@/components/kakao/kakao-app'
import { FINAL_DAY, FLAG_DAY4_YUSHI_STORY_TAG, GROUP_DONE_FLAG_PREFIX, WORK_FIRST_DAYS, workTransitionText } from '@/components/kakao/scripts'
import { MessagesApp } from '@/components/messages/messages-app'
import { PhotosApp } from '@/components/photos/photos-app'
import { SafariApp } from '@/components/safari/safari-app'
import { AblyApp } from '@/components/ably/ably-app'
import { DuolingoApp } from '@/components/duolingo/duolingo-app'
import { StockApp } from '@/components/stock/stock-app'
import { HotelApp } from '@/components/hotel/hotel-app'
import { MapsApp } from '@/components/maps/maps-app'
import { WeverseApp } from '@/components/weverse/weverse-app'
import { NotesApp } from '@/components/notes/notes-app'
import { EverytimeApp } from '@/components/everytime/everytime-app'
import { BaeminApp } from '@/components/baemin/baemin-app'
import { DEFAULT_INSTAGRAM_ID, DEFAULT_OWNER_NAME } from '@/lib/template-config'
import { isReplaying } from '@/lib/session-clock'
import {
  failReplay,
  finishReplay,
  loadSession,
  prepareReplay,
  replaySession,
  setSessionRoot,
  startSegment,
  type SavedSession,
} from '@/lib/session-recorder'
import { BustedScreen } from './busted-screen'
import { SpamOverlay } from './spam-overlay'
import type { SpamNotification } from '@/components/kakao/scripts'
import { DayIntro } from './day-intro'

/** 유우시 스토리 태그 허락 후 스토리가 올라오기까지 */
const YUSHI_STORY_DELAY_MS = 5000
/** 태그 알림 배너가 머무는 시간 (등장 지연 + 노출 + 퇴장) */
const TAG_NOTICE_MS = 6500
/** 5일 차 시작 후 대영 점심 스토리 태그 알림까지 (시온 카톡보다 먼저 뜨도록) */
const DAEYOUNG_TAG_DELAY_MS = 1200
import { TrueEndScreen } from './true-end-screen'
import { EndingCollection } from './ending-collection'
import { SettingsApp } from '@/components/settings/settings-app'
import { loadSavedSpeed } from '@/lib/game-settings'
import { FinalEndingScreen } from './final-ending-screen'
import { HomeScreen } from './home-screen'
import { IPhoneFrame } from './iphone-frame'
import { LockScreen } from './lock-screen'
import { NameIntro } from './name-intro'
import { NotificationBanner } from './notification-banner'
import { StatusBar } from './status-bar'
import { WorkTransition } from './work-transition'

type AppId =
  | 'kakao'
  | 'calendar'
  | 'safari'
  | 'messages'
  | 'instagram'
  | 'photos'
  | 'duolingo'
  | 'ably'
  | 'stock'
  | 'hotel'
  | 'maps'
  | 'weverse'
  | 'notes'
  | 'everytime'
  | 'baemin'
  | 'settings'

const INITIALS = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'c', 'k', 't', 'p', 'h']
const MEDIALS = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
const FINALS = ['', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lk', 'lm', 'lp', 'ls', 'lt', 'lp', 'lh', 'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'h']

function toInstagramId(name: string) {
  if (!name.trim() || name === DEFAULT_OWNER_NAME) return DEFAULT_INSTAGRAM_ID
  const romanized = [...name].map((character) => {
    const code = character.charCodeAt(0) - 0xac00
    if (code < 0 || code > 11171) return character
    const initial = Math.floor(code / 588)
    const medial = Math.floor((code % 588) / 28)
    const final = code % 28
    return `${INITIALS[initial]}${MEDIALS[medial]}${FINALS[final]}`
  }).join('')
  return romanized.toLowerCase().replace(/[^a-z0-9_]/g, '') || DEFAULT_INSTAGRAM_ID
}

const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function dayLabel(day: number) {
  const date = todayFor(day)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}`
}

const SAVE_KEY = 'fishbowl_save_v1'

type SaveData = { userName: string; snapshot: DaySnapshot }

function readSave(): SaveData | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    const data = raw ? (JSON.parse(raw) as SaveData) : null
    return data?.userName && data.snapshot?.day ? data : null
  } catch {
    return null
  }
}

function writeSave(userName: string | null, snapshot: DaySnapshot | null) {
  try {
    if (userName && snapshot) window.localStorage.setItem(SAVE_KEY, JSON.stringify({ userName, snapshot }))
    else window.localStorage.removeItem(SAVE_KEY)
  } catch {}
}

/**
 * 앱을 처음 열 때까지는 화면에 그리지 않습니다 (안 연 앱의 사진까지 메모리에 올라가 폰이 버티지 못하던 문제).
 * 처음 마운트될 때는 닫힌 상태로 한 프레임 그린 뒤 열어서, 여는 애니메이션도 그대로 보이게 합니다.
 */
function OnFirstOpen({ open, children }: { open: boolean; children: (open: boolean) => ReactNode }) {
  const [mounted, setMounted] = useState(open)
  const [ready, setReady] = useState(open)
  if (open && !mounted) setMounted(true)
  useEffect(() => {
    if (!mounted || ready) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [mounted, ready])
  if (!mounted) return null
  return <>{children(ready && open)}</>
}

export function PhoneSimulator() {
  const [run, setRun] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [resume, setResume] = useState<DaySnapshot | null>(null)
  /** 새로고침 직후: 저장된 기록을 빨리 감기로 재생해야 하는 구간 */
  const [pendingReplay, setPendingReplay] = useState<SavedSession | null>(null)
  const [replayProgress, setReplayProgress] = useState<number | null>(null)
  const latestSnapshotRef = useRef<DaySnapshot | null>(null)
  const userNameRef = useRef<string | null>(null)
  /** 지금 화면(PhoneSession)이 시작된 날짜. 날짜가 넘어가면 그 날의 시작 상태로 새 기록 구간을 엽니다. */
  const sessionDayRef = useRef(1)

  /** 새 기록 구간을 열고 화면을 그 상태로 다시 시작합니다 (하루 시작·다시하기·처음부터) */
  const restartSession = useCallback((snapshot: DaySnapshot | null, name: string | null) => {
    sessionDayRef.current = snapshot?.day ?? 1
    latestSnapshotRef.current = snapshot
    startSegment(snapshot, name)
    setUserName(name)
    setResume(snapshot)
    setRun((current) => current + 1)
  }, [])

  useEffect(() => {
    loadSavedSpeed()
    const session = loadSession()
    const save = readSave()
    if (session) {
      // 새로고침 전 기록이 있으면: 그 구간의 시작 상태로 화면을 띄운 뒤 입력 기록을 재생합니다.
      userNameRef.current = session.meta.userName ?? save?.userName ?? null
      latestSnapshotRef.current = session.meta.resume
      sessionDayRef.current = session.meta.resume?.day ?? 1
      prepareReplay(session)
      setUserName(session.meta.userName)
      setResume(session.meta.resume)
      setPendingReplay(session)
      setReplayProgress(0)
    } else if (save) {
      // 예전 버전 저장(하루 시작 상태만 있음): 그 날 처음부터 이어서 시작
      userNameRef.current = save.userName
      latestSnapshotRef.current = save.snapshot
      sessionDayRef.current = save.snapshot.day
      startSegment(save.snapshot, save.userName)
      setUserName(save.userName)
      setResume(save.snapshot)
    } else {
      startSegment(null, null)
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!pendingReplay) return
    let cancelled = false
    let shown = 0
    replaySession(pendingReplay, (ratio) => {
      // 화면 전체가 다시 그려지지 않도록 10% 단위로만 갱신
      if (cancelled || ratio - shown < 0.1) return
      shown = ratio
      setReplayProgress(ratio)
    })
      .then(() => {
        if (cancelled) return
        finishReplay()
        setPendingReplay(null)
        setReplayProgress(null)
      })
      .catch((error) => {
        console.error('[save] 기록 재생 실패, 그 날 처음부터 다시 시작합니다', error)
        if (cancelled) return
        failReplay()
        setPendingReplay(null)
        setReplayProgress(null)
        restartSession(pendingReplay.meta.resume, pendingReplay.meta.userName)
      })
    return () => {
      cancelled = true
    }
  }, [pendingReplay, restartSession])

  const handleDaySnapshot = useCallback(
    (snapshot: DaySnapshot) => {
      latestSnapshotRef.current = snapshot
      if (userNameRef.current) writeSave(userNameRef.current, snapshot)
      // 잠들기로 날짜가 넘어갔으면 이 날의 시작 상태에서 새 기록 구간을 시작합니다.
      if (snapshot.day > sessionDayRef.current && !isReplaying()) restartSession(snapshot, userNameRef.current)
    },
    [restartSession],
  )
  const handleStart = useCallback((name: string) => {
    userNameRef.current = name
    setUserName(name)
    writeSave(name, latestSnapshotRef.current)
  }, [])

  if (!loaded) return null

  return (
    <>
      <div ref={setSessionRoot} className="contents">
        <PhoneSession
          key={run}
          userName={userName}
          resume={resume}
          onStart={handleStart}
          onRename={handleStart}
          onDaySnapshot={handleDaySnapshot}
          onRetryDay={() => restartSession(latestSnapshotRef.current, userNameRef.current)}
          onRestart={() => {
            writeSave(null, null)
            restartSession(null, userNameRef.current)
          }}
        />
      </div>
      {replayProgress !== null && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-[#0b070c] text-white"
        >
          <p className="text-base font-semibold">이어서 불러오는 중…</p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-pink-300 transition-[width] duration-200" style={{ width: `${Math.round(replayProgress * 100)}%` }} />
          </div>
        </div>
      )}
    </>
  )
}

type PhoneSessionProps = {
  userName: string | null
  resume: DaySnapshot | null
  onStart: (name: string) => void
  onRename: (name: string) => void
  onDaySnapshot: (snapshot: DaySnapshot) => void
  onRetryDay: () => void
  onRestart: () => void
}

function PhoneSession({ userName, resume, onStart, onRename, onDaySnapshot, onRetryDay, onRestart }: PhoneSessionProps) {
  const startDay = Math.min(resume?.day ?? 1, FINAL_DAY)
  const [busted, setBusted] = useState(false)
  const [bustedAlert, setBustedAlert] = useState<string>()
  const [spams, setSpams] = useState<(SpamNotification & { key: number })[] | null>(null)
  const [trueEnd, setTrueEnd] = useState(false)
  const [viewingHistory, setViewingHistory] = useState(false)
  const [owner, setOwner] = useState<string | null>(resume ? userName : null)
  const [openApp, setOpenApp] = useState<AppId | null>(null)
  const [storyOpen, setStoryOpen] = useState(false)
  const [endingsOpen, setEndingsOpen] = useState(false)
  const [kakaoNotice, setKakaoNotice] = useState<{ id: string; text: string; nonce: number } | null>(null)
  const [safariNotification, setSafariNotification] = useState(false)
  const [safariNotificationUsed, setSafariNotificationUsed] = useState(false)
  const [autoOpenPostId, setAutoOpenPostId] = useState<string | null>(null)
  const [revealNotificationComment, setRevealNotificationComment] = useState(false)
  const [requestedRoom, setRequestedRoom] = useState<{ id: string; nonce: number } | null>(null)
  const [currentDay, setCurrentDay] = useState(startDay)
  const [introDoneDay, setIntroDoneDay] = useState(startDay - 1)
  const dayIntroDone = introDoneDay >= currentDay
  const showDayIntro = userName !== null && introDoneDay < currentDay
  const [finalSuspicion, setFinalSuspicion] = useState<Record<string, number> | null>(null)
  const [tagNotice, setTagNotice] = useState<{ nonce: number; handle: string; text: string } | null>(null)
  const showTagNotice = useCallback((handle: string, text: string) => {
    const nonce = Date.now()
    setTagNotice({ nonce, handle, text })
    window.setTimeout(() => setTagNotice((current) => (current?.nonce === nonce ? null : current)), TAG_NOTICE_MS)
  }, [])
  const finishDayIntro = useCallback(() => {
    setIntroDoneDay(currentDay)
    if (WORK_FIRST_DAYS.has(currentDay)) setWorkPhase('working')
  }, [currentDay])
  const handleDayComplete = useCallback(
    (suspicion: Record<string, number>) => {
      if (currentDay === FINAL_DAY) {
        // 마지막 카톡 5초 뒤 뒤풀이 전환 화면 → 닫히면 최종 선택 모달
        window.setTimeout(() => {
          interludeDoneRef.current = () => setFinalSuspicion({ ...suspicion })
          setKakaoNotice(null)
          setInterlude({ text: workTransitionText(FINAL_DAY), nonce: Date.now() })
        }, 5000)
        return
      }
      window.setTimeout(() => setSleepReady(true), 1500)
    },
    [currentDay],
  )
  const [sleepReady, setSleepReady] = useState(false)
  function goToSleep() {
    setSleepReady(false)
    setCurrentDay((day) => day + 1)
    setWorkPhase('before')
  }
  const [myStoryDay] = useState<number | null>(null)
  const hasMyStory = myStoryDay === currentDay
  const [workPhase, setWorkPhase] = useState<'before' | 'working' | 'after'>('before')
  const handlePreWorkDone = useCallback(() => {
    window.setTimeout(() => setWorkPhase((current) => (current === 'before' ? 'working' : current)), 1200)
  }, [])
  const [interlude, setInterlude] = useState<{ text: string; nonce: number } | null>(null)
  const interludeDoneRef = useRef<(() => void) | null>(null)
  const handleInterlude = useCallback((text: string, done: () => void) => {
    setKakaoNotice(null)
    interludeDoneRef.current = done
    setInterlude({ text, nonce: Date.now() })
  }, [])
  const finishInterlude = useCallback(() => {
    const done = interludeDoneRef.current
    interludeDoneRef.current = null
    setInterlude(null)
    done?.()
  }, [])
  const handleWorkDone = useCallback(() => {
  setWorkPhase('after')

    // 대영 국밥집 스토리는 afterWork 라서 전환이 끝난 뒤에 태그 알림을 띄움
    if (currentDay === DAEYOUNG_TAG_DAY) {
      window.setTimeout(
        () => showTagNotice(DAEYOUNG_ID, `@${DAEYOUNG_ID}님이 스토리에 회원님을 태그했습니다.`),
        DAEYOUNG_TAG_DELAY_MS,
      )
    }
  }, [currentDay, showTagNotice])

  const [yushiTagDay, setYushiTagDay] = useState<number | null>(null)
  const [autoOpenStory, setAutoOpenStory] = useState<{ handle: string; nonce: number } | null>(null)
  const [doneGroups, setDoneGroups] = useState<{ day: number; ids: ReadonlySet<string> }>({ day: 0, ids: new Set() })
  const todayDoneGroups = doneGroups.day === currentDay ? doneGroups.ids : undefined
  const handleFlag = useCallback(
    (flag: string) => {
      if (flag.startsWith(GROUP_DONE_FLAG_PREFIX)) {
        const id = flag.slice(GROUP_DONE_FLAG_PREFIX.length)
        const day = currentDay
        setDoneGroups((current) => ({ day, ids: new Set([...(current.day === day ? current.ids : []), id]) }))
        return
      }
      if (flag !== FLAG_DAY4_YUSHI_STORY_TAG) return
      const day = currentDay
      window.setTimeout(() => {
        setYushiTagDay(day)
        showTagNotice(YUSHI_ID, `${YUSHI_ID}님이 회원님을 태그했습니다.`)
      }, YUSHI_STORY_DELAY_MS)
    },
    [currentDay, showTagNotice],
  )

  const locked = owner === null
  const activeApp = locked ? null : openApp
  const appOpen = activeApp !== null
  const showStory = !locked && storyOpen && hasMyStory
  const lightChrome = showStory
  const name = userName ?? owner ?? DEFAULT_OWNER_NAME
  const instagramOwner = toInstagramId(name)

  const bannerKind = tagNotice !== null ? 'tag' : kakaoNotice ? 'kakao' : safariNotification ? 'safari' : null
  const bannerMessage =
    bannerKind === 'tag'
      ? (tagNotice?.text ?? '')
      : bannerKind === 'safari'
      ? NOTIFICATION_COMMENT
        ? `${NOTIFICATION_COMMENT.comment.name}님이 회원님의 게시물에 댓글을 달았습니다: ${NOTIFICATION_COMMENT.comment.text}`
        : ''
      : kakaoNotice
        ? `${CHAT_DISPLAY_NAMES[kakaoNotice.id] ?? '새 메시지'}: ${kakaoNotice.text}`
        : ''

  function openNotification() {
    if (bannerKind === 'tag') {
      setAutoOpenStory({ handle: tagNotice?.handle ?? YUSHI_ID, nonce: Date.now() })
      setTagNotice(null)
      setOpenApp('instagram')
    } else if (bannerKind === 'safari') {
      setSafariNotification(false)
      setAutoOpenPostId(NOTIFICATION_COMMENT?.postId ?? null)
      setRevealNotificationComment(true)
      setOpenApp('instagram')
    } else if (kakaoNotice) {
      setRequestedRoom({ id: kakaoNotice.id, nonce: Date.now() })
      setKakaoNotice(null)
      setOpenApp('kakao')
    }
  }

  function lock() {
    setOpenApp(null)
    setStoryOpen(false)
    setOwner(null)
  }

  function goHome() {
    setStoryOpen(false)
    setOpenApp(null)
  }

  const handleRoomOpen = useCallback((id: string) => {
    setKakaoNotice((current) => (current?.id === id ? null : current))
  }, [])

  return (
    <IPhoneFrame
      onSideButton={lock}
      onHomeBar={appOpen || showStory ? goHome : undefined}
      homeBarDark={appOpen && !lightChrome}
    >
      <HomeScreen
        active={!locked}
        appOpen={appOpen || showStory}
        day={currentDay}
        onOpenKakao={() => setOpenApp('kakao')}
        onOpenCalendar={() => setOpenApp('calendar')}
        onOpenSafari={() => { setOpenApp('safari'); if (NOTIFICATION_COMMENT && !safariNotificationUsed) { setSafariNotificationUsed(true); setSafariNotification(true) } }}
        onOpenMessages={() => setOpenApp('messages')}
        onOpenInstagram={() => setOpenApp('instagram')}
        onOpenPhotos={() => setOpenApp('photos')}
        onOpenDuolingo={() => setOpenApp('duolingo')}
        onOpenAbly={() => setOpenApp('ably')}
        onOpenStock={() => setOpenApp('stock')}
        onOpenHotel={() => setOpenApp('hotel')}
        onOpenMaps={() => setOpenApp('maps')}
        onOpenWeverse={() => setOpenApp('weverse')}
        onOpenNotes={() => setOpenApp('notes')}
        onOpenEverytime={() => setOpenApp('everytime')}
        onOpenBaemin={() => setOpenApp('baemin')}
        onOpenEndings={() => setEndingsOpen(true)}
        onOpenSettings={() => setOpenApp('settings')}
      />
      <OnFirstOpen open={activeApp === 'everytime'}>{(shown) => <EverytimeApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'baemin'}>{(shown) => <BaeminApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'notes'}>{(shown) => <NotesApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'photos'}>{(shown) => <PhotosApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'maps'}>{(shown) => <MapsApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'weverse'}>{(shown) => <WeverseApp open={shown} onClose={goHome} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'duolingo'}>{(shown) => <DuolingoApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'ably'}>{(shown) => <AblyApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'stock'}>{(shown) => <StockApp open={shown} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'hotel'}>{(shown) => <HotelApp open={shown} />}</OnFirstOpen>
      <KakaoApp
        open={activeApp === 'kakao'}
        owner={name}
        requestedRoom={requestedRoom}
        onRoomOpen={handleRoomOpen}
        onIncoming={(id, text) => setKakaoNotice({ id, text, nonce: Date.now() })}
        onBusted={(alert) => {
          setBustedAlert(alert)
          setBusted(true)
        }}
        onSpamStart={() => {
          setKakaoNotice(null)
          setSpams([])
        }}
        onSpam={(spam) => setSpams((current) => [...(current ?? []), { ...spam, key: current?.length ?? 0 }])}
        onDayComplete={handleDayComplete}
        clockStarted={dayIntroDone && (!WORK_FIRST_DAYS.has(currentDay) || workPhase === 'after')}
        workEnded={workPhase === 'after'}
        onPreWorkDone={handlePreWorkDone}
        day={currentDay}
        snapshot={resume}
        onDaySnapshot={onDaySnapshot}
        onInterlude={handleInterlude}
        onFlag={handleFlag}
      />
      <OnFirstOpen open={activeApp === 'calendar'}>{(shown) => <CalendarApp open={shown} day={currentDay} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'safari'}>{(shown) => <SafariApp open={shown} onVisit={() => { if (NOTIFICATION_COMMENT && !safariNotificationUsed) { setSafariNotificationUsed(true); setSafariNotification(true) } }} />}</OnFirstOpen>
      <OnFirstOpen open={activeApp === 'settings'}>
        {(shown) => (
          <SettingsApp
            open={shown}
            name={name}
            onRename={(next) => {
              onRename(next)
              setOwner(next)
            }}
          />
        )}
      </OnFirstOpen>
      <OnFirstOpen open={activeApp === 'messages'}>{(shown) => <MessagesApp open={shown} owner={name} />}</OnFirstOpen>
      <InstagramApp open={activeApp === 'instagram'} owner={instagramOwner} ownerName={name === DEFAULT_OWNER_NAME ? undefined : name} onOpenMyStory={() => setStoryOpen(true)} autoOpenPostId={autoOpenPostId} revealNotificationComment={revealNotificationComment} hasMyStory={hasMyStory} day={currentDay} workEnded={workPhase === 'after'} doneGroups={todayDoneGroups} yushiTagged={yushiTagDay === currentDay} autoOpenStory={autoOpenStory} />
      <StoryViewer open={showStory} owner={name} onClose={() => setStoryOpen(false)} />
      <LockScreen visible={locked} name={userName ?? ''} onUnlock={setOwner} dateLabel={dayLabel(currentDay)} />
      {userName === null && (
        <NameIntro
          onStart={(entered) => {
            onStart(entered)
            setOwner(entered)
          }}
        />
      )}
      <StatusBar locked={locked} dark={appOpen ? !lightChrome : true} />
      <NotificationBanner
        key={bannerKind === 'tag' ? `tag-${tagNotice?.nonce}` : bannerKind === 'kakao' ? `kakao-${kakaoNotice?.nonce}` : (bannerKind ?? owner ?? 'locked')}
        active={bannerKind !== null}
        appName={bannerKind === 'safari' || bannerKind === 'tag' ? 'Instagram' : 'KakaoTalk'}
        enterDelayMs={bannerKind === 'kakao' || bannerKind === 'tag' ? 250 : undefined}
        message={bannerMessage}
        onOpen={openNotification}
      />
      {showDayIntro && !busted && (
        <DayIntro key={currentDay} day={currentDay} dateLabel={dayLabel(currentDay)} onDone={finishDayIntro} />
      )}
      {workPhase === 'working' && !busted && <WorkTransition key={currentDay} text={workTransitionText(currentDay)} onDone={handleWorkDone} />}
      {interlude && !busted && <WorkTransition key={interlude.nonce} text={interlude.text} onDone={finishInterlude} />}
      {spams && !busted && <SpamOverlay spams={spams} />}
      {sleepReady && !busted && !spams && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-[86] flex flex-col items-center gap-2 px-6">
          <p className="rounded-full bg-black/60 px-3 py-1 text-xs text-white/90 backdrop-blur" role="status">
            오늘의 대화가 모두 끝났어요
          </p>
          <button
            type="button"
            onClick={goToSleep}
            className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full bg-[#1C1C3A] px-7 py-3 text-base font-semibold text-white shadow-xl ring-1 ring-white/20 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Moon className="size-5" aria-hidden />
            잠들기
          </button>
        </div>
      )}
      {busted && <BustedScreen day={currentDay} onRetryDay={onRetryDay} onRestart={onRestart} message={bustedAlert} />}
      {trueEnd && <TrueEndScreen onRestart={onRestart} />}
      {finalSuspicion && !busted && (
        <FinalEndingScreen
          owner={name}
          day={currentDay}
          suspicion={finalSuspicion}
          hidden={viewingHistory}
          onRetryDay={onRetryDay}
          onRestart={onRestart}
          onOpenCollection={() => setEndingsOpen(true)}
          onViewHistory={() => {
            setViewingHistory(true)
            setOwner((current) => current ?? name)
            setOpenApp('kakao')
          }}
        />
      )}
      {finalSuspicion && viewingHistory && (
        <button
          type="button"
          onClick={() => setViewingHistory(false)}
          className="absolute bottom-12 left-1/2 z-[86] min-h-11 -translate-x-1/2 rounded-full bg-black/85 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          엔딩 화면으로 돌아가기
        </button>
      )}
      <OnFirstOpen open={endingsOpen}>
        {(shown) => <EndingCollection open={shown} owner={name} onClose={() => setEndingsOpen(false)} />}
      </OnFirstOpen>
    </IPhoneFrame>
  )
}
