'use client'

import type { Map as LeafletMap } from 'leaflet'
import { CalendarCheck, LocateFixed, Map as MapIcon, Mic, Minus, Navigation, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { AppShell } from '@/components/phone/app-shell'
import { cn } from '@/lib/utils'
import { DirectionsHeader, NavigationView, PlaceSheet, RouteSheet } from './directions-ui'
import { MapCanvas } from './map-canvas'
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, QUICK_CHIPS, type TravelModeId } from './map-data'
import { MapSearch } from './map-search'
import { buildTrip, getPlace, HOME, toLatLng } from './map-utils'
import { NaverMapLogo } from './naver-map-logo'
import { PlaceIcon } from './place-icon'
import { ReservationsTab } from './reservations-tab'

type Tab = 'reserve' | 'directions'
type Route = { originId: string; destinationId: string | null }
type SearchTarget = 'place' | 'origin' | 'destination'

const TABS = [
  { id: 'directions', label: '지도', Icon: MapIcon },
  { id: 'reserve', label: '예약', Icon: CalendarCheck },
] as const

const SEARCH_PLACEHOLDERS: Record<SearchTarget, string> = {
  place: '장소, 버스, 지하철, 주소 검색',
  origin: '출발지 검색',
  destination: '도착지 검색',
}

const SHADOW = 'shadow-[0_1px_5px_rgba(0,0,0,0.18)]'

export function MapsApp({ open }: { open: boolean }) {
  const mapRef = useRef<LeafletMap | null>(null)
  const [tab, setTab] = useState<Tab>('directions')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [route, setRoute] = useState<Route | null>(null)
  const [mode, setMode] = useState<TravelModeId>('walk')
  const [searchTarget, setSearchTarget] = useState<SearchTarget | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [navStep, setNavStep] = useState<number | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const selectedPlace = route ? null : getPlace(selectedId)
  const origin = route ? getPlace(route.originId) : null
  const destination = route ? getPlace(route.destinationId) : null
  const trip = origin && destination && origin.id !== destination.id ? buildTrip(origin, destination, mode) : null
  const navPoint = trip && navStep !== null ? trip.points[Math.min(navStep, trip.points.length - 1)] : null

  function focus(x: number, y: number, minZoom = 0) {
    const map = mapRef.current
    if (!map) return
    const z = Math.max(map.getZoom(), minZoom)
    const point = map.project(toLatLng(x, y), z).add([0, map.getSize().y * 0.15])
    map.flyTo(map.unproject(point, z), z, { duration: 0.6 })
  }

  function startRoute(originId: string, destinationId: string | null) {
    const a = getPlace(originId)
    if (!a) return
    const b = getPlace(destinationId)
    setSelectedId(null)
    setNavStep(null)
    setTab('directions')
    setRoute({ originId, destinationId: b && b.id !== a.id ? b.id : null })
    const map = mapRef.current
    if (!map) return
    if (b && b.id !== a.id) {
      map.flyToBounds([toLatLng(a.x, a.y), toLatLng(b.x, b.y)], {
        paddingTopLeft: [40, 190],
        paddingBottomRight: [40, 320],
        maxZoom: 18,
        duration: 0.6,
      })
    } else {
      focus(a.x, a.y, 16)
    }
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
    focus(place.x, place.y, 17)
  }

  function openSearch(target: SearchTarget, query = '') {
    setSearchQuery(query)
    setSearchTarget(target)
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
    focus(x, y, 18)
  }

  function selectPlaceFromList(id: string) {
    setRoute(null)
    setNavStep(null)
    const place = getPlace(id)
    if (!place) return
    setTab('directions')
    setSelectedId(id)
    focus(place.x, place.y, 17)
  }

  return (
    <AppShell open={open} label="네이버 지도" className="bg-white text-[#1E1E1E]">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <MapCanvas
          mapRef={mapRef}
          active={open}
          zoom={zoom}
          onZoomChange={setZoom}
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
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pb-3 pt-[52px]">
              <button
                type="button"
                onClick={() => openSearch('place')}
                className={cn('pointer-events-auto flex h-12 w-full items-center gap-2.5 rounded-xl bg-white px-3.5 text-left', SHADOW)}
              >
                <NaverMapLogo className="size-6 shrink-0" />
                <span className="flex-1 truncate text-[15px] text-[#8E8E8E]">{SEARCH_PLACEHOLDERS.place}</span>
                <Mic aria-hidden className="size-5 text-[#555]" />
              </button>
              <div className="pointer-events-auto -mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.query}
                    type="button"
                    onClick={() => openSearch('place', chip.query)}
                    className={cn(
                      'flex h-9 shrink-0 items-center gap-1 rounded-full bg-white pl-2 pr-3 text-[13px] font-semibold text-[#333]',
                      SHADOW,
                    )}
                  >
                    <PlaceIcon kind={chip.kind} className="size-5" iconClassName="size-3" />
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {!selectedPlace && (
              <div className="absolute bottom-5 right-3 z-10 flex flex-col items-end gap-2.5">
                <div className={cn('flex flex-col overflow-hidden rounded-lg bg-white', SHADOW)}>
                  <button
                    type="button"
                    aria-label="지도 확대"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() => mapRef.current?.zoomIn()}
                    className="flex size-11 items-center justify-center text-[#333] active:bg-[#F2F2F2] disabled:text-[#C8C8C8]"
                  >
                    <Plus className="size-5" />
                  </button>
                  <span aria-hidden className="mx-2 h-px bg-[#EBEBEB]" />
                  <button
                    type="button"
                    aria-label="지도 축소"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={() => mapRef.current?.zoomOut()}
                    className="flex size-11 items-center justify-center text-[#333] active:bg-[#F2F2F2] disabled:text-[#C8C8C8]"
                  >
                    <Minus className="size-5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="내 위치로 이동"
                  onClick={() => focus(HOME.x, HOME.y, 16)}
                  className={cn('flex size-11 items-center justify-center rounded-lg bg-white text-[#03C75A]', SHADOW)}
                >
                  <LocateFixed className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => startRoute(HOME.id, null)}
                  className="flex h-12 items-center gap-1.5 rounded-full bg-[#03C75A] px-5 text-[15px] font-bold text-white shadow-[0_2px_8px_rgba(3,199,90,0.45)] active:bg-[#02B350]"
                >
                  <Navigation aria-hidden className="size-4 fill-white" />
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
              onPickOrigin={() => openSearch('origin')}
              onPickDestination={() => openSearch('destination')}
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
            key={`${searchTarget}-${searchQuery}`}
            initialQuery={searchQuery}
            placeholder={SEARCH_PLACEHOLDERS[searchTarget]}
            excludeId={searchTarget === 'destination' ? route?.originId : null}
            onClose={() => setSearchTarget(null)}
            onPick={handlePick}
          />
        )}
      </div>

      <nav aria-label="지도 메뉴" className="relative z-[1100] grid shrink-0 grid-cols-2 border-t border-[#EBEBEB] bg-white pb-[22px] pt-2">
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
              <Icon aria-hidden className={cn('size-6', active ? 'text-[#03C75A]' : 'text-[#9A9A9A]')} />
              <span className={cn('text-[11px]', active ? 'font-bold text-[#1E1E1E]' : 'text-[#9A9A9A]')}>{label}</span>
            </button>
          )
        })}
      </nav>
    </AppShell>
  )
}
