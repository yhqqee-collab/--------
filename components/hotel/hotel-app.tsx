'use client'

import { CalendarDays, Check, ChevronLeft, Clock, Heart, MapPin, Search, Star, UserRound, Users } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import { MY_BOOKINGS, STAY_CATEGORIES, STAY_SEARCH, STAYS, type Room, type Stay } from './hotel-data'

const won = (n: number) => n.toLocaleString('ko-KR')

export function HotelApp({ open }: { open: boolean }) {
  const [category, setCategory] = useState(STAY_CATEGORIES[0])
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null)
  const [liked, setLiked] = useState<Set<string>>(() => new Set())
  const [myPageOpen, setMyPageOpen] = useState(false)

  const stays = category === STAY_CATEGORIES[0] ? STAYS : STAYS.filter((stay) => stay.category === category)

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AppShell open={open} label="숙박" className="bg-[#F5F6F8] text-[#111]">
      <header className="shrink-0 bg-white px-4 pb-3 pt-[52px]">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-black tracking-tight text-[#2374B9]">숙박</h1>
          <button
            type="button"
            onClick={() => setMyPageOpen(true)}
            aria-label="마이페이지"
            className="flex size-9 items-center justify-center rounded-full text-[#333] active:bg-[#F0F2F5]"
          >
            <UserRound className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="mt-3 rounded-2xl border border-[#E3E6EA] p-3">
          <label className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-[#2374B9]" strokeWidth={2.4} aria-hidden />
            <span className="sr-only">숙소 검색</span>
            <input
              type="search"
              placeholder={`${STAY_SEARCH.location} · 숙소명 검색`}
              className="w-full bg-transparent text-[13px] font-semibold outline-none placeholder:text-[#333]"
            />
          </label>
          <div className="mt-2.5 flex items-center gap-3 border-t border-[#EEF0F2] pt-2.5 text-[12px] text-[#555]">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" aria-hidden />
              {STAY_SEARCH.dates}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" aria-hidden />
              {`성인 ${STAY_SEARCH.guests}`}
            </span>
          </div>
        </div>
        <nav
          aria-label="숙소 유형"
          className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STAY_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === category}
              onClick={() => setCategory(item)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
                item === category ? 'border-[#2374B9] bg-[#2374B9] text-white' : 'border-[#E3E6EA] bg-white text-[#555]',
              )}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-10 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="text-[12px] text-[#777]">{`숙소 ${stays.length}개`}</p>
        <ul className="mt-2 flex flex-col gap-3">
          {stays.map((stay) => {
            const isLiked = liked.has(stay.id)
            const lowest = Math.min(...stay.rooms.map((room) => room.price))
            return (
              <li key={stay.id} className="relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <button type="button" onClick={() => setSelectedStay(stay)} className="block w-full text-left active:opacity-80">
                  <div className={cn('h-[120px] overflow-hidden bg-gradient-to-br', stay.tone)}>
                    <img src={stay.image} alt={stay.name} className="size-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-semibold text-[#2374B9]">{stay.category}</p>
                    <p className="mt-0.5 text-[15px] font-bold">{stay.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[12px] text-[#555]">
                      <Star className="size-3.5 fill-[#FFB400] text-[#FFB400]" aria-hidden />
                      <span className="font-semibold text-[#111]">{stay.rating}</span>
                      <span>{`(${won(stay.reviews)})`}</span>
                      <span aria-hidden>·</span>
                      <span className="truncate">{stay.area}</span>
                    </p>
                    <p className="mt-2 text-right text-[16px] font-bold tabular-nums">
                      {`${won(lowest)}원`}
                      <span className="ml-0.5 text-[11px] font-medium text-[#888]">~ / 1박</span>
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  aria-pressed={isLiked}
                  aria-label={isLiked ? `${stay.name} 찜 해제` : `${stay.name} 찜하기`}
                  onClick={() => toggleLike(stay.id)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center active:scale-90"
                >
                  <Heart
                    aria-hidden
                    className={cn(
                      'size-[22px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
                      isLiked ? 'fill-[#FF3B5C] text-[#FF3B5C]' : 'fill-black/10 text-white',
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </main>

      {selectedStay && <StayDetail key={selectedStay.id} stay={selectedStay} onBack={() => setSelectedStay(null)} />}
      {myPageOpen && <MyPage onBack={() => setMyPageOpen(false)} />}
    </AppShell>
  )
}

function MyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex animate-in slide-in-from-right flex-col bg-[#F5F6F8] duration-300">
      <header className="relative flex shrink-0 items-center justify-center bg-white px-4 pb-3 pt-[52px]">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="absolute bottom-2 left-2 flex size-9 items-center justify-center active:opacity-60"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </button>
        <h2 className="text-[16px] font-bold">마이페이지</h2>
      </header>

      <div className="flex-1 overflow-y-auto pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <section className="flex items-center gap-3 bg-white px-4 pb-5 pt-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#E8F1F9]">
            <UserRound className="size-7 text-[#2374B9]" aria-hidden />
          </div>
          <div>
            <p className="text-[16px] font-bold">회원님</p>
            <p className="mt-0.5 text-[12px] text-[#777]">일반 회원</p>
          </div>
        </section>

        <section aria-labelledby="my-bookings-title" className="mt-2 px-4 pt-4">
          <div className="flex items-baseline justify-between">
            <h3 id="my-bookings-title" className="text-[16px] font-bold">
              나의 예약 내역
            </h3>
            <span className="text-[12px] text-[#777]">{`총 ${MY_BOOKINGS.length}건`}</span>
          </div>
          {MY_BOOKINGS.length === 0 && (
            <p className="mt-3 rounded-2xl bg-white p-6 text-center text-[13px] text-[#777]">예약 내역이 없습니다.</p>
          )}
          <ul className="mt-3 flex flex-col gap-3">
            {MY_BOOKINGS.map((booking) => (
              <li key={booking.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between border-b border-[#EEF0F2] px-4 py-2.5">
                  <span className="text-[12px] font-semibold text-[#555]">{booking.date}</span>
                  <span className="rounded-full bg-[#EEF0F2] px-2 py-0.5 text-[11px] font-semibold text-[#666]">
                    이용 완료
                  </span>
                </div>
                <div className="flex gap-3 p-4">
                  <div
                    className={cn(
                      'size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br',
                      booking.tone,
                    )}
                  >
                    <img src={booking.image} alt={booking.stayName} className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] font-bold">{booking.stayName}</span>
                      <span className="shrink-0 rounded bg-[#E8F1F9] px-1.5 py-0.5 text-[10px] font-bold text-[#2374B9]">
                        {booking.type}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[#777]">
                      <MapPin className="size-3" aria-hidden />
                      {`${booking.area} · ${booking.room}`}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-[#333]">
                      <Clock className="size-3.5" aria-hidden />
                      {booking.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[#EEF0F2] px-4 py-2.5">
                  <span className="text-[12px] text-[#777]">결제 금액</span>
                  <span className="text-[14px] font-bold tabular-nums">{`${won(booking.price)}원`}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function StayDetail({ stay, onBack }: { stay: Stay; onBack: () => void }) {
  const [room, setRoom] = useState<Room | null>(null)
  const [booked, setBooked] = useState(false)

  return (
    <div className="absolute inset-0 z-10 flex animate-in slide-in-from-right flex-col bg-white duration-300">
      <div className="flex-1 overflow-y-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={cn('relative h-[200px] bg-gradient-to-br', stay.tone)}>
          <img src={stay.image} alt={stay.name} className="size-full object-cover" />
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로 가기"
            className="absolute left-3 top-[50px] flex size-9 items-center justify-center rounded-full bg-white/90 shadow active:scale-90"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
        </div>

        <div className="px-4 pt-4">
          <p className="text-[12px] font-semibold text-[#2374B9]">{stay.category}</p>
          <h2 className="mt-0.5 text-[20px] font-bold">{stay.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-[#555]">
            <Star className="size-3.5 fill-[#FFB400] text-[#FFB400]" aria-hidden />
            <span className="font-semibold text-[#111]">{stay.rating}</span>
            <span>{`후기 ${won(stay.reviews)}개`}</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-[#555]">
            <MapPin className="size-3.5" aria-hidden />
            {stay.area}
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {stay.tags.map((tag) => (
              <li key={tag} className="rounded-md bg-[#EEF5FB] px-2 py-1 text-[11px] font-semibold text-[#2374B9]">
                {tag}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-[#444]">{stay.description}</p>
        </div>

        <section aria-label="객실 선택" className="mt-5 border-t-8 border-[#F5F6F8] px-4 pt-4">
          <h3 className="text-[15px] font-bold">객실 선택</h3>
          <p className="mt-0.5 text-[12px] text-[#777]">{`${STAY_SEARCH.dates} · ${STAY_SEARCH.nights}박`}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {stay.rooms.map((item) => {
              const selected = room?.id === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRoom(item)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-2xl border-2 p-3 text-left transition-colors',
                      selected ? 'border-[#2374B9] bg-[#F3F8FD]' : 'border-[#E9ECEF]',
                    )}
                  >
                    <span>
                      <span className="block text-[14px] font-bold">{item.name}</span>
                      <span className="mt-0.5 block text-[11px] text-[#777]">{item.detail}</span>
                    </span>
                    <span className="text-[15px] font-bold tabular-nums">{`${won(item.price)}원`}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="shrink-0 border-t border-[#EEF0F2] bg-white px-4 pb-[30px] pt-3">
        <button
          type="button"
          disabled={!room}
          onClick={() => setBooked(true)}
          className="h-12 w-full rounded-2xl bg-[#2374B9] text-[15px] font-bold text-white transition-opacity active:scale-[0.98] disabled:opacity-40"
        >
          {room ? `${won(room.price)}원 예약하기` : '객실을 선택하세요'}
        </button>
      </div>

      {booked && room && (
        <div className="absolute inset-0 z-20 flex items-end bg-black/40 animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-done-title"
            className="w-full animate-in slide-in-from-bottom rounded-t-3xl bg-white px-5 pb-[34px] pt-6 duration-300"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#2374B9]">
              <Check className="size-6 text-white" strokeWidth={3} aria-hidden />
            </span>
            <h3 id="booking-done-title" className="mt-3 text-center text-[18px] font-bold">
              예약이 완료되었습니다
            </h3>
            <dl className="mt-4 space-y-1.5 rounded-2xl bg-[#F5F6F8] p-4 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[#777]">숙소</dt>
                <dd className="font-semibold">{stay.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#777]">객실</dt>
                <dd className="font-semibold">{room.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#777]">일정</dt>
                <dd className="font-semibold">{STAY_SEARCH.dates}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#777]">결제 금액</dt>
                <dd className="font-bold text-[#2374B9] tabular-nums">{`${won(room.price)}원`}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 h-12 w-full rounded-2xl bg-[#2374B9] text-[15px] font-bold text-white active:scale-[0.98]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
