'use client'

import { useCallback, useRef, useState } from 'react'
import { Moon } from 'lucide-react'
import type { DaySnapshot } from '@/components/kakao/snapshot'
import { CalendarApp } from '@/components/calendar/calendar-app'
import { todayFor } from '@/components/calendar/calendar-data'
import { InstagramApp } from '@/components/instagram/instagram-app'
import { StoryViewer } from '@/components/instagram/story-viewer'
import { NOTIFICATION_COMMENT } from '@/components/instagram/instagram-data'
import { CHAT_DISPLAY_NAMES } from '@/components/kakao/chat-data'
import { KakaoApp } from '@/components/kakao/kakao-app'
import { FINAL_DAY, WORK_FIRST_DAYS, workTransitionText } from '@/components/kakao/scripts'
import { MessagesApp } from '@/components/messages/messages-app'
import { PhotosApp } from '@/components/photos/photos-app'
import { SafariApp } from '@/components/safari/safari-app'
import { AblyApp } from '@/components/ably/ably-app'
import { DuolingoApp } from '@/components/duolingo/duolingo-app'
import { StockApp } from '@/components/stock/stock-app'
import { HotelApp } from '@/components/hotel/hotel-app'
import { MapsApp } from '@/components/maps/maps-app'
import { WeverseApp } from '@/components/weverse/weverse-app'
import { FortuneApp } from '@/components/fortune/fortune-app'
import { NotesApp } from '@/components/notes/notes-app'
import { EverytimeApp } from '@/components/everytime/everytime-app'
import { BaeminApp } from '@/components/baemin/baemin-app'
import { DEFAULT_INSTAGRAM_ID, DEFAULT_OWNER_NAME } from '@/lib/template-config'
import { BustedScreen } from './busted-screen'
import { SpamOverlay } from './spam-overlay'
import type { SpamNotification } from '@/components/kakao/scripts'
import { DayIntro } from './day-intro'
import { PostypeGate } from './postype-gate'

const DEMO_LAST_DAY = 2
import { TrueEndScreen } from './true-end-screen'
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
  | 'fortune'
  | 'notes'
  | 'everytime'
  | 'baemin'

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

export function PhoneSimulator() {
  const [run, setRun] = useState(0)
  const [userName, setUserName] = useState<string | null>(null)
  const [resume, setResume] = useState<DaySnapshot | null>(null)
  const latestSnapshotRef = useRef<DaySnapshot | null>(null)
  const handleDaySnapshot = useCallback((snapshot: DaySnapshot) => {
    latestSnapshotRef.current = snapshot
  }, [])
  return (
    <PhoneSession
      key={run}
      userName={userName}
      resume={resume}
      onStart={setUserName}
      onDaySnapshot={handleDaySnapshot}
      onRetryDay={() => {
        setResume(latestSnapshotRef.current)
        setRun((current) => current + 1)
      }}
      onRestart={() => {
        latestSnapshotRef.current = null
        setResume(null)
        setRun((current) => current + 1)
      }}
    />
  )
}

type PhoneSessionProps = {
  userName: string | null
  resume: DaySnapshot | null
  onStart: (name: string) => void
  onDaySnapshot: (snapshot: DaySnapshot) => void
  onRetryDay: () => void
  onRestart: () => void
}

function PhoneSession({ userName, resume, onStart, onDaySnapshot, onRetryDay, onRestart }: PhoneSessionProps) {
  const startDay = resume?.day ?? 1
  const [busted, setBusted] = useState(false)
  const [bustedAlert, setBustedAlert] = useState<string>()
  const [spams, setSpams] = useState<(SpamNotification & { key: number })[] | null>(null)
  const [trueEnd, setTrueEnd] = useState(false)
  const [viewingHistory, setViewingHistory] = useState(false)
  const [owner, setOwner] = useState<string | null>(resume ? userName : null)
  const [openApp, setOpenApp] = useState<AppId | null>(null)
  const [storyOpen, setStoryOpen] = useState(false)
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
  const finishDayIntro = useCallback(() => {
    setIntroDoneDay(currentDay)
    if (WORK_FIRST_DAYS.has(currentDay)) setWorkPhase('working')
  }, [currentDay])
  const handleDayComplete = useCallback(
    (suspicion: Record<string, number>) => {
      if (currentDay === FINAL_DAY) {
        window.setTimeout(() => setFinalSuspicion({ ...suspicion }), 2500)
        return
      }
      window.setTimeout(() => setSleepReady(true), 1500)
    },
    [currentDay],
  )
  const [sleepReady, setSleepReady] = useState(false)
  const [postypeGate, setPostypeGate] = useState(false)
  function goToSleep() {
    setSleepReady(false)
    if (currentDay >= DEMO_LAST_DAY) {
      setPostypeGate(true)
      return
    }
    setCurrentDay((day) => day + 1)
    setWorkPhase('before')
  }
  const [myStoryDay, setMyStoryDay] = useState<number | null>(null)
  const hasMyStory = myStoryDay === currentDay
  const [workPhase, setWorkPhase] = useState<'before' | 'working' | 'after'>('before')
  const handlePreWorkDone = useCallback(() => {
    window.setTimeout(() => setWorkPhase((current) => (current === 'before' ? 'working' : current)), 1200)
  }, [])
  const handleWorkDone = useCallback(() => {
    setWorkPhase('after')
    if (currentDay === 1) setMyStoryDay(currentDay)
  }, [currentDay])

  const locked = owner === null
  const activeApp = locked ? null : openApp
  const appOpen = activeApp !== null
  const showStory = !locked && storyOpen && hasMyStory
  const lightChrome = showStory
  const name = userName ?? owner ?? DEFAULT_OWNER_NAME
  const instagramOwner = toInstagramId(name)

  const bannerKind = kakaoNotice ? 'kakao' : safariNotification ? 'safari' : null
  const bannerMessage =
    bannerKind === 'safari'
      ? NOTIFICATION_COMMENT
        ? `${NOTIFICATION_COMMENT.comment.name}님이 회원님의 게시물에 댓글을 달았습니다: ${NOTIFICATION_COMMENT.comment.text}`
        : ''
      : kakaoNotice
        ? `${CHAT_DISPLAY_NAMES[kakaoNotice.id] ?? '새 메시지'}: ${kakaoNotice.text}`
        : ''

  function openNotification() {
    if (bannerKind === 'safari') {
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
        onOpenFortune={() => setOpenApp('fortune')}
        onOpenNotes={() => setOpenApp('notes')}
        onOpenEverytime={() => setOpenApp('everytime')}
        onOpenBaemin={() => setOpenApp('baemin')}
      />
      <EverytimeApp open={activeApp === 'everytime'} />
      <BaeminApp open={activeApp === 'baemin'} />
      <FortuneApp open={activeApp === 'fortune'} day={currentDay} dateLabel={dayLabel(currentDay)} />
      <NotesApp open={activeApp === 'notes'} />
      <PhotosApp open={activeApp === 'photos'} />
      <MapsApp open={activeApp === 'maps'} />
      <WeverseApp open={activeApp === 'weverse'} onClose={goHome} />
      <DuolingoApp open={activeApp === 'duolingo'} />
      <AblyApp open={activeApp === 'ably'} />
      <StockApp open={activeApp === 'stock'} />
      <HotelApp open={activeApp === 'hotel'} />
      <KakaoApp
        open={activeApp === 'kakao'}
        owner={name}
        requestedRoom={requestedRoom}
        onRoomOpen={handleRoomOpen}
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
      />
      <CalendarApp open={activeApp === 'calendar'} day={currentDay} />
      <SafariApp open={activeApp === 'safari'} onVisit={() => { if (NOTIFICATION_COMMENT && !safariNotificationUsed) { setSafariNotificationUsed(true); setSafariNotification(true) } }} />
      <MessagesApp open={activeApp === 'messages'} owner={name} />
      <InstagramApp open={activeApp === 'instagram'} owner={instagramOwner} ownerName={name === DEFAULT_OWNER_NAME ? undefined : name} onOpenMyStory={() => setStoryOpen(true)} autoOpenPostId={autoOpenPostId} revealNotificationComment={revealNotificationComment} hasMyStory={hasMyStory} day={currentDay} />
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
        key={bannerKind === 'kakao' ? `kakao-${kakaoNotice?.nonce}` : (bannerKind ?? owner ?? 'locked')}
        active={bannerKind !== null}
        appName={bannerKind === 'safari' ? 'Instagram' : 'KakaoTalk'}
        enterDelayMs={bannerKind === 'kakao' ? 250 : undefined}
        message={bannerMessage}
        onOpen={openNotification}
      />
      {showDayIntro && !busted && (
        <DayIntro key={currentDay} day={currentDay} dateLabel={dayLabel(currentDay)} onDone={finishDayIntro} />
      )}
      {workPhase === 'working' && !busted && <WorkTransition key={currentDay} text={workTransitionText(currentDay)} onDone={handleWorkDone} />}
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
      {postypeGate && !busted && <PostypeGate day={currentDay} onRestart={onRestart} />}
      {trueEnd && <TrueEndScreen onRestart={onRestart} />}
      {finalSuspicion && !busted && (
        <FinalEndingScreen
          owner={name}
          day={currentDay}
          suspicion={finalSuspicion}
          hidden={viewingHistory}
          onRetryDay={onRetryDay}
          onRestart={onRestart}
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
    </IPhoneFrame>
  )
}
