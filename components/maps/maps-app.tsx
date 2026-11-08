'use client'

import { CalendarCheck, LocateFixed, Mic, Minus, Navigation, Plus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import { DirectionsHeader, NavigationView, PlaceSheet, RouteSheet } from './directions-ui'
import { MapCanvas } from './map-canvas'
import { DEFAULT_ZOOM, MAP_HEIGHT, MAP_WIDTH, MAX_ZOOM, MIN_ZOOM, QUICK_CHIPS, type TravelModeId } from './map-data'

function fitZoom(el: HTMLElement) {
  if (!el.clientWidth || !el.clientHeight) return MIN_ZOOM
  return Math.min(MIN_ZOOM, el.clientWidth / MAP_WIDTH, el.clientHeight / MAP_HEIGHT) * 0.55
}

function mapOffset(el: HTMLElement, zoom: number): [number, number] {
  return [
    Math.max(0, (el.clientWidth - MAP_WIDTH * zoom) / 2),
    Math.max(0, (el.clientHeight - MAP_HEIGHT * zoom) / 2),
  ]
}
import { MapSearch } from './map-search'
import { buildTrip, getPlace, HOME, scrollMapTo } from './map-utils'
import { PlaceIcon } from './place-icon'
import { ReservationsTab } from './reservations-tab'

type Tab = 'reserve' | 'directions'
type Route = { originId: string; destinationId: string | null }
type SearchTarget = 'place' | 'origin' | 'destination'

const TABS = [
  { id: 'reserve', label: '예약', Icon: CalendarCheck },
  { id: 'directions', label: '길찾기', Icon: Navigation },
] as const

const SEARCH_PLACEHOLDERS: Record<SearchTarget, string> = {
  place: '여기서 검색',
  origin: '출발지 검색',
  destination: '도착지 검색',
}

export function MapsApp({ open }: { open: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<Tab>('directions')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [mode, setMode] = useState<TravelModeId>('car')
  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null)
  const [navStep, setNavStep] = useState<number | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const renderedZoom = useRef(DEFAULT_ZOOM)
  const pendingAnchor = useRef<{ bx: number; by: number; ax: number; ay: number } | null>(null)

  useEffect(() => {
    scrollMapTo(scrollRef.current, HOME.x, HOME.y, DEFAULT_ZOOM, 'instant')
  }, [])

  const [minZoom, setMinZoom] = useState(MIN_ZOOM)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setMinZoom(fitZoom(el))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    renderedZoom.current = zoom
    const el = scrollRef.current
    const anchor = pendingAnchor.current
    if (!el || !anchor) return
    const [offsetX, offsetY] = mapOffset(el, zoom)
    el.scrollLeft = anchor.bx * zoom + offsetX - anchor.ax
    el.scrollTop = anchor.by * zoom + offsetY - anchor.ay
    pendingAnchor.current = null
  }, [zoom])

  function zoomTo(next: number, anchorX?: number, anchorY?: number) {
    const el = scrollRef.current
    if (!el) return
    const clamped = Math.min(MAX_ZOOM, Math.max(fitZoom(el), next))
    const ax = anchorX ?? el.clientWidth / 2
    const ay = anchorY ?? el.clientHeight / 2
    const [offsetX, offsetY] = mapOffset(el, renderedZoom.current)
    pendingAnchor.current = {
      bx: (el.scrollLeft + ax - offsetX) / renderedZoom.current,
      by: (el.scrollTop + ay - offsetY) / renderedZoom.current,
      ax,
      ay,
    }
    setZoom(clamped)
  }

  const selectedPlace = route ? null : getPlace(selectedId)
  const origin = route ? getPlace(route.originId) : null
  const destination = route ? getPlace(route.destinationId) : null
  const trip = origin && destination && origin.id !== destination.id ? buildTrip(origin, destination, mode) : null
  const navPoint = trip && navStep !== null ? trip.points[Math.min(navStep, trip.points.length - 1)] : null

  function focus(x: number, y: number) {
    scrollMapTo(scrollRef.current, x, y, renderedZoom.current)
  }

  function startRoute(originId: string, destinationId: string | null) {
    const a = getPlace(originId)
    if (!a) return
    const b = getPlace(destinationId)
    setSelectedId(null)
    setNavStep(null)
    setTab('directions')
    setRoute({ originId, destinationId: b && b.id !== a.id ? b.id : null })
    focus(b ? (a.x + b.x) / 2 : a.x, b ? (a.y + b.y) / 2 : a.y)
  }

  function selectPlace(id: string) {
    const place = getPlace(id)
    if (!place) return
    if (route) {
      if (navStep === null && id !== route.originId) startRoute(route.originId, id)
      return
    }
    setTab('directions')
    setSelectedId(id)
    focus(place.x, place.y)
  }

  function handlePick(id: string) {
    const target = searchTarget
    setSearchTarget(null)
    if (target === 'origin' && route) startRoute(id, route.destinationId === id ? null : route.destinationId)
    else if (target === 'destination' && route) startRoute(route.originId, id)
    else selectPlace(id)
  }

  function goToStep(step: number) {
    if (!trip) return
    setNavStep(step)
    const [x, y] = trip.points[Math.min(step, trip.points.length - 1)]
    focus(x, y)
  }

  return (
    <AppShell open={open} label="구글 지도" className="bg-white text-[#202124]">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <MapCanvas
          scrollRef={scrollRef}
          zoom={zoom}
          onZoom={zoomTo}
          selectedId={route ? route.destinationId : selectedId}
          route={trip ? { points: trip.points, mode } : null}
          navPoint={navPoint}
          onSelect={selectPlace}
          onBackground={() => {
            if (!route) setSelectedId(null)
          }}
        />

        {!route && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-white/70 to-transparent px-3 pb-3 pt-[52px]">
              <button
                type="button"
                onClick={() => setSearchTarget('place')}
                className="pointer-events-auto flex h-12 w-full items-center gap-3 rounded-full bg-white px-4 text-left shadow-[0_1px_6px_rgba(60,64,67,0.3)]"
              >
                <span className="relative size-6 shrink-0">
                  <Image src="/images/icons/google-maps.jpeg" alt="" fill sizes="24px" className="object-contain mix-blend-multiply" />
                </span>
                <span className="flex-1 text-[16px] text-[#5F6368]">여기서 검색</span>
                <Mic aria-hidden className="size-5 text-[#5F6368]" />
              </button>
              <div className="pointer-events-auto -mx-3 mt-2 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {QUICK_CHIPS.map((chip) => {
                  const place = getPlace(chip.id)
                  if (!place) return null
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => selectPlace(chip.id)}
                      className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white pl-1.5 pr-3.5 text-[14px] font-medium text-[#3C4043] shadow-[0_1px_4px_rgba(60,64,67,0.28)]"
                    >
                      <PlaceIcon kind={place.kind} className="size-7" iconClassName="size-3.5" />
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {!selectedPlace && (
              <div className="absolute bottom-4 right-3 z-10 flex flex-col items-end gap-3">
                <div className="flex flex-col overflow-hidden rounded-full bg-white shadow-[0_1px_6px_rgba(60,64,67,0.3)]">
                  <button
                    type="button"
                    aria-label="지도 확대"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() => zoomTo(zoom * 1.4)}
                    className="flex size-12 items-center justify-center text-[#3C4043] active:bg-[#F1F3F4] disabled:text-[#BDC1C6]"
                  >
                    <Plus className="size-5" />
                  </button>
                  <span aria-hidden className="mx-2.5 h-px bg-[#E8EAED]" />
                  <button
                    type="button"
                    aria-label="지도 축소"
                    disabled={zoom <= minZoom + 0.001}
                    onClick={() => zoomTo(zoom / 1.4)}
                    className="flex size-12 items-center justify-center text-[#3C4043] active:bg-[#F1F3F4] disabled:text-[#BDC1C6]"
                  >
                    <Minus className="size-5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="내 위치로 이동"
                  onClick={() => focus(HOME.x, HOME.y)}
                  className="flex size-12 items-center justify-center rounded-full bg-white text-[#1A73E8] shadow-[0_1px_6px_rgba(60,64,67,0.3)]"
                >
                  <LocateFixed className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => startRoute(HOME.id, null)}
                  className="flex h-14 items-center gap-2 rounded-2xl bg-[#1A73E8] px-5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(26,115,232,0.45)] active:bg-[#1765CC]"
                >
                  <Navigation aria-hidden className="size-5 fill-white" />
                  길찾기
                </button>
              </div>
            )}

            {selectedPlace && (
              <PlaceSheet
                place={selectedPlace}
                onClose={() => setSelectedId(null)}
                onDirections={() => startRoute(HOME.id, selectedPlace.id)}
                onSetOrigin={() => startRoute(selectedPlace.id, null)}
                onSelect={selectPlace}
              />
            )}
          </>
        )}

        {route && origin && (navStep === null || !trip) && (
          <>
            <DirectionsHeader
              origin={origin}
              destination={destination}
              mode={mode}
              onModeChange={setMode}
              onBack={() => setRoute(null)}
              onPickOrigin={() => setSearchTarget('origin')}
              onPickDestination={() => setSearchTarget('destination')}
              onSwap={() => route.destinationId && startRoute(route.destinationId, route.originId)}
            />
            <RouteSheet
              origin={origin}
              trip={trip}
              mode={mode}
              onPickDestination={(id) => startRoute(origin.id, id)}
              onStart={() => goToStep(0)}
            />
          </>
        )}

        {trip && navStep !== null && (
          <NavigationView trip={trip} step={navStep} onNext={() => goToStep(navStep + 1)} onEnd={() => setNavStep(null)} />
        )}

        {tab === 'reserve' && (
          <ReservationsTab onDirections={(id) => startRoute(HOME.id, id)} onShowOnMap={selectPlaceFromList} />
        )}

        {searchTarget && (
          <MapSearch
            placeholder={SEARCH_PLACEHOLDERS[searchTarget]}
            excludeId={searchTarget === 'destination' ? route?.originId : null}
            onClose={() => setSearchTarget(null)}
            onPick={handlePick}
          />
        )}
      </div>

      <nav aria-label="지도 메뉴" className="relative z-40 grid shrink-0 grid-cols-2 border-t border-[#E8EAED] bg-white pb-[22px] pt-2">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                setTab(id)
                setSearchTarget(null)
              }}
              className="flex min-h-11 flex-col items-center gap-1 py-1"
            >
              <span className={cn('flex h-8 w-16 items-center justify-center rounded-full transition-colors', active && 'bg-[#D3E3FD]')}>
                <Icon aria-hidden className={cn('size-5', active ? 'text-[#0B57D0]' : 'text-[#444746]')} />
              </span>
              <span className={cn('text-[12px]', active ? 'font-semibold text-[#0B57D0]' : 'text-[#444746]')}>{label}</span>
            </button>
          )
        })}
      </nav>
    </AppShell>
  )

  function selectPlaceFromList(id: string) {
    setRoute(null)
    setNavStep(null)
    const place = getPlace(id)
    if (!place) return
    setTab('directions')
    setSelectedId(id)
    focus(place.x, place.y)
  }
}
