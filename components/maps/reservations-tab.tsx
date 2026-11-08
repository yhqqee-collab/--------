import { CalendarDays, Car, MapPin, Navigation, StickyNote, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RESERVATIONS, type Reservation } from './map-data'
import { buildTrip, formatDuration, getPlace, HOME } from './map-utils'
import { PlaceIcon } from './place-icon'

const STATUS_STYLES: Record<Reservation['status'], string> = {
  '예약 확정': 'bg-[#E6F4EA] text-[#137333]',
  '대기 중': 'bg-[#FEF7E0] text-[#B06000]',
  '방문 완료': 'bg-[#F1F3F4] text-[#5F6368]',
}

type ReservationsTabProps = {
  onDirections: (placeId: string) => void
  onShowOnMap: (placeId: string) => void
}

export function ReservationsTab({ onDirections, onShowOnMap }: ReservationsTabProps) {
  const upcoming = RESERVATIONS.filter((item) => item.status !== '방문 완료')
  const past = RESERVATIONS.filter((item) => item.status === '방문 완료')

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-[#F8F9FA] px-4 pb-6 pt-[58px]">
      <h1 className="text-[26px] font-semibold text-[#202124]">예약</h1>
      <p className="mt-1 text-[14px] text-[#5F6368]">Google 지도에서 한 예약을 확인하세요</p>

      <ReservationSection title="예정된 예약" items={upcoming} onDirections={onDirections} onShowOnMap={onShowOnMap} />
      <ReservationSection title="지난 예약" items={past} onDirections={onDirections} onShowOnMap={onShowOnMap} />
    </div>
  )
}

function ReservationSection({
  title,
  items,
  onDirections,
  onShowOnMap,
}: ReservationsTabProps & { title: string; items: Reservation[] }) {
  return (
    <section className="mt-6" aria-label={title}>
      <h2 className="mb-2 text-[15px] font-semibold text-[#3C4043]">
        {title} <span className="font-normal text-[#5F6368]">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-[14px] text-[#5F6368]">예약 내역이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const place = getPlace(item.placeId)
            if (!place) return null
            const trip = place.id === HOME.id ? null : buildTrip(HOME, place, 'car')
            const done = item.status === '방문 완료'
            return (
              <li key={item.id} className="rounded-2xl border border-[#E8EAED] bg-white p-4">
                <div className="flex items-start gap-3">
                  <PlaceIcon kind={place.kind} className="size-10" iconClassName="size-5" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold text-[#202124]">{item.title}</p>
                    <p className="flex items-center gap-1 text-[13px] text-[#5F6368]">
                      <MapPin aria-hidden className="size-3.5" />
                      {place.name} · {place.dong}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold', STATUS_STYLES[item.status])}>
                    {item.status}
                  </span>
                </div>

                <dl className="mt-3 grid gap-1.5 text-[14px] text-[#3C4043]">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">일시</dt>
                    <CalendarDays aria-hidden className="size-4 text-[#5F6368]" />
                    <dd>
                      {item.date} {item.time}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">인원</dt>
                    <Users aria-hidden className="size-4 text-[#5F6368]" />
                    <dd>{item.people}명</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">메모</dt>
                    <StickyNote aria-hidden className="size-4 text-[#5F6368]" />
                    <dd>{item.note}</dd>
                  </div>
                  {trip && (
                    <div className="flex items-center gap-2">
                      <dt className="sr-only">이동 시간</dt>
                      <Car aria-hidden className="size-4 text-[#5F6368]" />
                      <dd>
                        집에서 {formatDuration(trip.minutes)} · {trip.km}km
                      </dd>
                    </div>
                  )}
                </dl>

                <div className={cn('mt-4 flex gap-2', done && 'opacity-80')}>
                  <button
                    type="button"
                    onClick={() => onDirections(place.id)}
                    className="flex h-11 items-center gap-2 rounded-full bg-[#1A73E8] px-4 text-[14px] font-semibold text-white active:bg-[#1765CC]"
                  >
                    <Navigation aria-hidden className="size-4 fill-white" />
                    길찾기
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowOnMap(place.id)}
                    className="flex h-11 items-center rounded-full border border-[#DADCE0] px-4 text-[14px] font-semibold text-[#1A73E8] active:bg-black/5"
                  >
                    지도에서 보기
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
