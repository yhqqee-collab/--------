import {
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Bike,
  Bus,
  Car,
  Circle,
  CornerUpLeft,
  CornerUpRight,
  Footprints,
  MapPin,
  Navigation,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AREA_GROUP, PLACES, TRAVEL_MODES, type Place, type TravelModeId } from './map-data'
import {
  arrivalLabel,
  buildTrip,
  formatDuration,
  HOME,
  placeLabel,
  routeKm,
  routeMinutes,
  type StepIcon,
  type Trip,
} from './map-utils'
import { PlaceIcon } from './place-icon'

const MODE_ICONS = { car: Car, transit: Bus, walk: Footprints, bike: Bike } satisfies Record<TravelModeId, unknown>

const STEP_ICONS = {
  start: Circle,
  straight: ArrowUp,
  left: CornerUpLeft,
  right: CornerUpRight,
  walk: Footprints,
  bus: Bus,
  end: MapPin,
} satisfies Record<StepIcon, unknown>

const sheetClass =
  'absolute inset-x-0 bottom-0 z-20 rounded-t-[24px] bg-white px-4 pb-4 pt-2 shadow-[0_-2px_14px_rgba(60,64,67,0.22)]'

function Handle() {
  return <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-[#DADCE0]" />
}

type DirectionsHeaderProps = {
  origin: Place
  destination: Place | null
  mode: TravelModeId
  onModeChange: (mode: TravelModeId) => void
  onBack: () => void
  onPickOrigin: () => void
  onPickDestination: () => void
  onSwap: () => void
}

export function DirectionsHeader({
  origin,
  destination,
  mode,
  onModeChange,
  onBack,
  onPickOrigin,
  onPickDestination,
  onSwap,
}: DirectionsHeaderProps) {
  const km = destination ? routeKm(origin, destination) : 0

  return (
    <div className="absolute inset-x-0 top-0 z-20 bg-white px-2 pb-2 pt-[50px] shadow-[0_2px_8px_rgba(60,64,67,0.18)]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="길찾기 닫기"
          onClick={onBack}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#3C4043] active:bg-black/5"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
          <button
            type="button"
            onClick={onPickOrigin}
            className="flex h-11 items-center gap-3 rounded-lg border border-[#DADCE0] px-3 text-left text-[15px] text-[#202124]"
          >
            <span aria-hidden className="size-3 shrink-0 rounded-full border-[3px] border-[#1A73E8]" />
            <span className="sr-only">출발지: </span>
            <span className="truncate">{placeLabel(origin)}</span>
          </button>
          <button
            type="button"
            onClick={onPickDestination}
            className="flex h-11 items-center gap-3 rounded-lg border border-[#DADCE0] px-3 text-left text-[15px]"
          >
            <MapPin aria-hidden className="size-4 shrink-0 text-[#EA4335]" />
            <span className="sr-only">도착지: </span>
            <span className={cn('truncate', destination ? 'text-[#202124]' : 'text-[#80868B]')}>
              {destination ? placeLabel(destination) : '도착지 선택'}
            </span>
          </button>
        </div>
        <button
          type="button"
          aria-label="출발지와 도착지 바꾸기"
          onClick={onSwap}
          disabled={!destination}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#3C4043] active:bg-black/5 disabled:opacity-30"
        >
          <ArrowUpDown className="size-5" />
        </button>
      </div>

      {destination && (
        <div role="radiogroup" aria-label="이동 수단" className="mt-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
          {TRAVEL_MODES.map((item) => {
            const Icon = MODE_ICONS[item.id]
            const active = item.id === mode
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${item.label} ${formatDuration(routeMinutes(km, item.id))}`}
                onClick={() => onModeChange(item.id)}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[14px]',
                  active ? 'bg-[#E8F0FE] font-semibold text-[#1A73E8]' : 'text-[#3C4043]',
                )}
              >
                <Icon aria-hidden className="size-4" />
                {formatDuration(routeMinutes(km, item.id))}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

type RouteSheetProps = {
  origin: Place
  trip: Trip | null
  mode: TravelModeId
  onPickDestination: (id: string) => void
  onStart: () => void
}

export function RouteSheet({ origin, trip, mode, onPickDestination, onStart }: RouteSheetProps) {
  if (!trip) {
    return (
      <div className={sheetClass}>
        <Handle />
        <h2 className="text-[18px] font-semibold text-[#202124]">어디로 갈까요?</h2>
        <ul className="mt-2 max-h-[220px] overflow-y-auto">
          {PLACES.filter((place) => place.id !== origin.id).map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => onPickDestination(place.id)}
                className="flex min-h-[52px] w-full items-center gap-3 py-1.5 text-left active:bg-black/5"
              >
                <PlaceIcon kind={place.kind} className="size-8" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] text-[#202124]">{place.name}</span>
                  <span className="block text-[13px] text-[#5F6368]">{place.dong}</span>
                </span>
                <span className="text-[13px] text-[#5F6368]">{routeKm(origin, place)}km</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const modeLabel = TRAVEL_MODES.find((item) => item.id === mode)?.label

  return (
    <div className={cn(sheetClass, 'max-h-[46%] overflow-y-auto')}>
      <Handle />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[24px] font-semibold leading-tight text-[#188038]">
            {formatDuration(trip.minutes)}{' '}
            <span className="text-[16px] font-normal text-[#5F6368]">({trip.km}km)</span>
          </p>
          <p className="mt-0.5 text-[14px] text-[#5F6368]">
            {arrivalLabel(trip.minutes)} · {modeLabel} 최적 경로
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#1A73E8] px-5 text-[15px] font-semibold text-white active:bg-[#1765CC]"
        >
          <Navigation aria-hidden className="size-4 fill-white" />
          시작
        </button>
      </div>

      <ol className="mt-4 flex flex-col border-t border-[#E8EAED] pt-2">
        {trip.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.icon]
          return (
            <li key={index} className="flex items-center gap-3 py-2">
              <Icon
                aria-hidden
                className={cn(
                  'size-5 shrink-0',
                  step.icon === 'end' ? 'text-[#EA4335]' : step.icon === 'start' ? 'text-[#1A73E8]' : 'text-[#5F6368]',
                )}
              />
              <span className="text-[15px] text-[#3C4043]">{step.text}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

type NavigationViewProps = {
  trip: Trip
  step: number
  onNext: () => void
  onEnd: () => void
}

export function NavigationView({ trip, step, onNext, onEnd }: NavigationViewProps) {
  const current = trip.steps[step]
  const Icon = STEP_ICONS[current.icon]
  const last = step === trip.steps.length - 1
  const remaining = Math.max(0, Math.round(trip.minutes * (1 - step / (trip.steps.length - 1))))

  return (
    <>
      <div
        role="status"
        className="absolute inset-x-3 top-[52px] z-20 flex items-center gap-3 rounded-2xl bg-[#1E8E3E] p-4 text-white shadow-lg"
      >
        <Icon aria-hidden className="size-8 shrink-0" />
        <p className="min-w-0 flex-1 text-[18px] font-semibold leading-snug">
          {last ? '목적지에 도착했습니다' : current.text}
        </p>
      </div>
      <div className={cn(sheetClass, 'flex items-center gap-3 py-3')}>
        <button
          type="button"
          aria-label="안내 종료"
          onClick={onEnd}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F1F3F4] text-[#C5221F]"
        >
          <X className="size-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[20px] font-semibold text-[#188038]">{last ? '도착' : formatDuration(remaining)}</p>
          <p className="text-[13px] text-[#5F6368]">
            {trip.km}km · {arrivalLabel(remaining)}
          </p>
        </div>
        <button
          type="button"
          onClick={last ? onEnd : onNext}
          className="flex h-11 shrink-0 items-center rounded-full bg-[#1A73E8] px-4 text-[15px] font-semibold text-white"
        >
          {last ? '완료' : '다음 안내'}
        </button>
      </div>
    </>
  )
}

type PlaceSheetProps = {
  place: Place
  onClose: () => void
  onDirections: () => void
  onSetOrigin: () => void
  onSelect: (id: string) => void
}

export function PlaceSheet({ place, onClose, onDirections, onSetOrigin, onSelect }: PlaceSheetProps) {
  const fromHome = place.id === HOME.id ? null : buildTrip(HOME, place, 'car')
  const inGroup = AREA_GROUP.placeIds.includes(place.id)

  return (
    <div className={sheetClass}>
      <Handle />
      <div className="flex items-start gap-3">
        <PlaceIcon kind={place.kind} className="size-11" iconClassName="size-5" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-semibold leading-tight text-[#202124]">{place.name}</h2>
          <p className="mt-0.5 text-[14px] text-[#5F6368]">
            {place.dong} · {place.address}
          </p>
          <p className="mt-0.5 text-[13px] text-[#5F6368]">{place.description}</p>
        </div>
        <button
          type="button"
          aria-label="장소 정보 닫기"
          onClick={onClose}
          className="-mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-[#5F6368] active:bg-black/5"
        >
          <X className="size-5" />
        </button>
      </div>

      {fromHome && (
        <p className="mt-3 flex items-center gap-1.5 text-[14px] text-[#3C4043]">
          <Car aria-hidden className="size-4 text-[#5F6368]" />집에서 자동차로 {formatDuration(fromHome.minutes)} · {fromHome.km}km
        </p>
      )}

      {inGroup && (
        <div className="mt-3">
          <p className="text-[13px] font-medium text-[#6B3FA0]">{AREA_GROUP.name}</p>
          <div className="mt-1.5 flex gap-2">
            {AREA_GROUP.placeIds.map((id) => {
              const member = PLACES.find((item) => item.id === id)
              if (!member) return null
              const active = id === place.id
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(id)}
                  className={cn(
                    'h-10 rounded-full border px-4 text-[14px]',
                    active ? 'border-[#8E63CE] bg-[#F3EDFB] font-semibold text-[#6B3FA0]' : 'border-[#DADCE0] text-[#3C4043]',
                  )}
                >
                  {member.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onDirections}
          className="flex h-11 items-center gap-2 rounded-full bg-[#1A73E8] px-5 text-[15px] font-semibold text-white active:bg-[#1765CC]"
        >
          <Navigation aria-hidden className="size-4 fill-white" />
          길찾기
        </button>
        <button
          type="button"
          onClick={onSetOrigin}
          className="flex h-11 items-center gap-2 rounded-full border border-[#DADCE0] px-5 text-[15px] font-semibold text-[#1A73E8] active:bg-black/5"
        >
          출발
        </button>
      </div>
    </div>
  )
}
