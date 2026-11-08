import {
  AREA_GROUP,
  MAP_SCALE,
  METERS_PER_PX,
  PLACES,
  ROAD_FACTOR,
  TRAVEL_MODES,
  type Place,
  type TravelModeId,
} from './map-data'

export type StepIcon = 'start' | 'straight' | 'left' | 'right' | 'walk' | 'bus' | 'end'
export type RouteStep = { text: string; icon: StepIcon }
export type Point = [number, number]
export type Trip = { km: number; minutes: number; points: Point[]; steps: RouteStep[] }

export const HOME = PLACES[0]

export function getPlace(id: string | null | undefined) {
  return PLACES.find((place) => place.id === id) ?? null
}

export function placeLabel(place: Place) {
  return place.id === HOME.id ? '내 위치 (집)' : `${place.name} (${place.dong})`
}

export function routeKm(a: Place, b: Place) {
  const px = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
  return Math.round((px * METERS_PER_PX * ROAD_FACTOR * 0.8) / 100) / 10
}

export function routeMinutes(km: number, mode: TravelModeId) {
  const travel = TRAVEL_MODES.find((item) => item.id === mode) ?? TRAVEL_MODES[0]
  return Math.max(1, Math.round((km / travel.speedKmh) * 60 + travel.extraMin))
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}분`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}시간 ${rest}분` : `${hours}시간`
}

export function arrivalLabel(minutes: number) {
  const date = new Date(Date.now() + minutes * 60_000)
  const hours = date.getHours()
  const period = hours < 12 ? '오전' : '오후'
  return `${period} ${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} 도착`
}

function routeSteps(a: Place, b: Place, mode: TravelModeId, km: number): RouteStep[] {
  const dy = b.y - a.y
  const dx = b.x - a.x
  const vertical = Math.abs(dy)
  const horizontal = Math.abs(dx)
  const total = vertical + horizontal || 1
  const part = (length: number) => `${Math.max(0.1, (km * length) / total).toFixed(1)}km`
  const start: RouteStep = { text: `${a.name}(${a.dong})에서 출발`, icon: 'start' }
  const end: RouteStep = { text: `${b.name}(${b.dong}) 도착`, icon: 'end' }

  if (mode === 'transit') {
    const seed = a.x + b.x + a.y + b.y
    const bus = 100 + (seed % 600)
    const stops = Math.max(2, Math.round(km * 1.1))
    return [
      start,
      { text: `${a.dong} 정류장까지 도보 ${2 + (seed % 3)}분`, icon: 'walk' },
      { text: `${bus}번 버스 승차 · ${stops}개 정류장 이동`, icon: 'bus' },
      { text: `${b.dong} 정류장 하차 후 도보 ${2 + (seed % 4)}분`, icon: 'walk' },
      end,
    ]
  }

  const verb = mode === 'car' ? '주행' : '이동'
  const steps: RouteStep[] = [start]
  if (vertical > 0) {
    steps.push({ text: `${dy > 0 ? '남쪽' : '북쪽'} 방향으로 ${part(vertical)} ${verb}`, icon: 'straight' })
  }
  if (horizontal > 0) {
    const direction = dx > 0 ? '동쪽' : '서쪽'
    if (vertical === 0) {
      steps.push({ text: `${direction} 방향으로 ${part(horizontal)} ${verb}`, icon: 'straight' })
    } else {
      const turnRight = dy > 0 !== dx > 0
      steps.push({
        text: `${turnRight ? '우회전' : '좌회전'} 후 ${direction} 방향으로 ${part(horizontal)} ${verb}`,
        icon: turnRight ? 'right' : 'left',
      })
    }
  }
  steps.push(end)
  return steps
}

export function buildTrip(a: Place, b: Place, mode: TravelModeId): Trip {
  const km = routeKm(a, b)
  return {
    km,
    minutes: routeMinutes(km, mode),
    points: [
      [a.x, a.y],
      [a.x, b.y],
      [b.x, b.y],
    ],
    steps: routeSteps(a, b, mode, km),
  }
}

const normalize = (value: string) => value.toLowerCase().replace(/[\s·]+/g, '')

export function searchPlaces(query: string) {
  const q = normalize(query)
  if (!q) return PLACES
  return PLACES.filter((place) =>
    [
      place.name,
      place.dong,
      place.address,
      place.description,
      ...(place.keywords ?? []),
      AREA_GROUP.placeIds.includes(place.id) ? AREA_GROUP.name : '',
    ].some((field) => field && normalize(field).includes(q)),
  )
}

export function scrollMapTo(
  el: HTMLElement | null,
  x: number,
  y: number,
  zoom: number,
  behavior: ScrollBehavior = 'smooth',
) {
  const scale = zoom * MAP_SCALE
  el?.scrollTo({ left: x * scale - el.clientWidth / 2, top: y * scale - el.clientHeight * 0.4, behavior })
}
