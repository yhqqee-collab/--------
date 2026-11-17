import { cn } from '@/lib/utils'
import { AppFolder } from './app-folder'
import { AppIcon } from './app-icon'
import {
  HotelArt,
  InstagramArt,
  KakaoArt,
  MessagesArt,
  PhoneArt,
  PhotosArt,
  SafariArt,
  XArt,
  YouTubeMusicArt,
} from './app-icon-art'
import { AblyArt, BaeminArt, DuolingoArt, EverytimeArt, NaverMapArt, StockArt, WeverseArt } from './extra-app-art'
import { EndingCollectionArt } from './ending-collection'
import { Wallpaper } from './wallpaper'
import { CalendarWidget, NotesWidget } from './widgets'

type HomeScreenProps = {
  active: boolean
  appOpen: boolean
  day: number
  onOpenKakao: () => void
  onOpenCalendar: () => void
  onOpenSafari: () => void
  onOpenMessages: () => void
  onOpenInstagram: () => void
  onOpenPhotos: () => void
  onOpenDuolingo: () => void
  onOpenAbly: () => void
  onOpenStock: () => void
  onOpenHotel: () => void
  onOpenMaps: () => void
  onOpenWeverse: () => void
  onOpenNotes: () => void
  onOpenEverytime: () => void
  onOpenBaemin: () => void
  onOpenEndings: () => void
}

export function HomeScreen({
  active,
  appOpen,
  day,
  onOpenKakao,
  onOpenCalendar,
  onOpenSafari,
  onOpenMessages,
  onOpenInstagram,
  onOpenPhotos,
  onOpenDuolingo,
  onOpenAbly,
  onOpenStock,
  onOpenHotel,
  onOpenMaps,
  onOpenWeverse,
  onOpenNotes,
  onOpenEverytime,
  onOpenBaemin,
  onOpenEndings,
}: HomeScreenProps) {
  return (
    <section aria-label="홈 화면" aria-hidden={!active} inert={!active} className="absolute inset-0">
      <Wallpaper />
      <div
        className={cn(
          'relative flex h-full flex-col px-[22px] pb-[30px] pt-[68px] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
          !active
            ? 'scale-[1.14] opacity-0'
            : appOpen
              ? 'scale-[0.94] opacity-60'
              : 'scale-100 opacity-100',
        )}
      >
        <div className="grid grid-cols-4 gap-x-[16px] gap-y-[24px]">
          <CalendarWidget day={day} onClick={onOpenCalendar} />
          <NotesWidget onClick={onOpenNotes} />
          <AppIcon name="사진" onClick={onOpenPhotos}>
            <PhotosArt />
          </AppIcon>
          <AppIcon name="카카오톡" badge="99+" onClick={onOpenKakao}>
            <KakaoArt />
          </AppIcon>
          <AppIcon name="인스타그램" onClick={onOpenInstagram}>
            <InstagramArt />
          </AppIcon>
          <AppIcon name="숙박" onClick={onOpenHotel}>
            <HotelArt />
          </AppIcon>
          <AppIcon name="X">
            <XArt />
          </AppIcon>
          <AppIcon name="네이버 지도" onClick={onOpenMaps}>
            <NaverMapArt />
          </AppIcon>
          <AppIcon name="배달의민족" onClick={onOpenBaemin}>
            <BaeminArt />
          </AppIcon>
          <AppFolder
            name="기타"
            apps={[
              { name: '듀오링고', onClick: onOpenDuolingo, art: <DuolingoArt /> },
              { name: '에이블리', onClick: onOpenAbly, art: <AblyArt /> },
              { name: '주식', onClick: onOpenStock, art: <StockArt /> },
              { name: 'Weverse', onClick: onOpenWeverse, art: <WeverseArt /> },
              { name: '에브리타임', onClick: onOpenEverytime, art: <EverytimeArt /> },
            ]}
          />
          <AppIcon name="엔딩 도감" onClick={onOpenEndings}>
            <EndingCollectionArt />
          </AppIcon>
        </div>

        <div className="mt-auto flex flex-col items-center gap-[14px]">
          <div
            role="img"
            aria-label="페이지 1/2"
            className="flex items-center gap-[7px] rounded-full bg-white/15 px-[13px] py-[8px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-1px_1px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.12)] ring-[0.5px] ring-inset ring-white/30 backdrop-blur-xl"
          >
            <span className="size-[7px] rounded-full bg-white" />
            <span className="size-[7px] rounded-full bg-white/45" />
          </div>

          <nav
            aria-label="Dock"
            className="grid w-[calc(100%+12px)] grid-cols-4 justify-items-center rounded-[38px] bg-white/[0.16] px-[14px] py-[15px] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),inset_0_-1px_1.5px_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.18)] ring-[0.5px] ring-inset ring-white/35 backdrop-blur-xl backdrop-saturate-150"
          >
            <AppIcon name="전화" showLabel={false}>
              <PhoneArt />
            </AppIcon>
            <AppIcon name="메시지" showLabel={false} badge="1" onClick={onOpenMessages}>
              <MessagesArt />
            </AppIcon>
            <AppIcon name="YouTube Music" showLabel={false}>
              <YouTubeMusicArt />
            </AppIcon>
            <AppIcon name="사파리" showLabel={false} disabled>
              <SafariArt />
            </AppIcon>
          </nav>
        </div>
      </div>
    </section>
  )
}
