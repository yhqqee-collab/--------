'use client'

import 'leaflet/dist/leaflet.css'
import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet'
import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import {
  CAMPUS,
  CAMPUS_BUILDINGS,
  CAMPUS_ROADS,
  DEFAULT_ZOOM,
  ICON_ZOOM,
  KOREA_BOUNDS,
  LABEL_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  PLACES,
  type Place,
  type TravelModeId,
} from './map-data'
import { HOME, toLatLng, type Point } from './map-utils'
import { NEIGHBORHOOD_MIN_ZOOM, NEIGHBORHOOD_SHAPES } from './map-neighborhood'
import { KIND_STYLES, PlaceIcon } from './place-icon'

type Leaflet = typeof import('leaflet')

const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const LABEL_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
const ALWAYS_VISIBLE = new Set(['home'])
export const INITIAL_CENTER: Point = [0, 0]

const ROUTE_COLORS: Record<TravelModeId, { line: string; outline: string }> = {
  car: { line: '#03C75A', outline: '#02873D' },
  transit: { line: '#2F6FE4', outline: '#1D4FAF' },
  walk: { line: '#03C75A', outline: '#02873D' },
  bike: { line: '#00A8A8', outline: '#007A7A' },
}

type MapCanvasProps = {
  mapRef: MutableRefObject<LeafletMap | null>
  active: boolean
  zoom: number
  selectedId: string | null
  route: { points: Point[]; mode: TravelModeId } | null
  navPoint: Point | null
  onZoomChange: (zoom: number) => void
  onSelect: (id: string) => void
  onBackground: () => void
}

export function MapCanvas({ mapRef, active, zoom, selectedId, route, navPoint, onZoomChange, onSelect, onBackground }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, Marker>>({})
  const overlayRef = useRef<LayerGroup | null>(null)
  const [leaflet, setLeaflet] = useState<Leaflet | null>(null)
  const [elements, setElements] = useState<Record<string, HTMLElement>>({})
  const handlers = useRef({ onZoomChange, onBackground })

  useEffect(() => {
    handlers.current = { onZoomChange, onBackground }
  })

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    import('leaflet').then((module) => {
      const L = (module as unknown as { default?: Leaflet }).default ?? (module as Leaflet)
      if (cancelled || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: toLatLng(...INITIAL_CENTER),
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: KOREA_BOUNDS,
        maxBoundsViscosity: 1,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 1,
        wheelPxPerZoomLevel: 90,
      })
      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)

      L.tileLayer(TILE_URL, {
        maxZoom: NEIGHBORHOOD_MIN_ZOOM + 1,
        maxNativeZoom: 13,
        attribution: 'Tiles &copy; Esri',
      }).addTo(map)
      L.tileLayer(LABEL_URL, { maxZoom: NEIGHBORHOOD_MIN_ZOOM - 1, maxNativeZoom: 13, pane: 'overlayPane' }).addTo(map)

      const renderer = L.canvas({ padding: 0.5 })
      const neighborhood = L.layerGroup(
        NEIGHBORHOOD_SHAPES.map((shape) =>
          L.polygon(
            shape.points.map(([x, y]) => toLatLng(x, y)),
            { renderer, color: shape.stroke, weight: 1, fillColor: shape.fill, fillOpacity: 1, interactive: false },
          ),
        ),
      )
      const syncNeighborhood = () => {
        if (!map) return
        const visible = map.getZoom() >= NEIGHBORHOOD_MIN_ZOOM
        if (visible && !map.hasLayer(neighborhood)) neighborhood.addTo(map)
        if (!visible && map.hasLayer(neighborhood)) neighborhood.remove()
      }
      syncNeighborhood()
      map.on('zoomend', syncNeighborhood)

      L.polygon(
        CAMPUS.points.map(([x, y]) => toLatLng(x, y)),
        { color: '#B7CAEA', weight: 1, fillColor: '#DCE6F7', fillOpacity: 0.9, interactive: false },
      ).addTo(map)

      const roadMap = map
      const roadStyle = { lineCap: 'round', lineJoin: 'round', interactive: false } as const
      const roadLines = CAMPUS_ROADS.map((road) => ({
        width: road.width,
        latLngs: road.points.map(([x, y]) => toLatLng(x, y)),
      }))
      // Draw every border before any white fill so junctions merge without seams.
      const roadEdges = roadLines.map((road) =>
        L.polyline(road.latLngs, { ...roadStyle, color: '#C3D1EA', opacity: 1 }).addTo(roadMap),
      )
      const roadLayers = roadLines.map((road, index) => ({
        width: road.width,
        edge: roadEdges[index],
        fill: L.polyline(road.latLngs, { ...roadStyle, color: '#FFFFFF', opacity: 1 }).addTo(roadMap),
      }))
      const syncRoadWidths = () => {
        if (!map) return
        const metersPerPixel = (156543.03 * Math.cos((map.getCenter().lat * Math.PI) / 180)) / 2 ** map.getZoom()
        for (const road of roadLayers) {
          const weight = road.width / metersPerPixel
          road.fill.setStyle({ weight })
          road.edge.setStyle({ weight: weight > 1.5 ? weight + 3 : 0 })
        }
      }
      syncRoadWidths()
      map.on('zoomend', syncRoadWidths)

      for (const building of CAMPUS_BUILDINGS) {
        const halfW = building.w / 2
        const halfH = building.h / 2
        const corners: Point[] = [
          [building.x - halfW, building.y - halfH],
          [building.x + halfW, building.y - halfH],
          [building.x + halfW, building.y + halfH],
          [building.x - halfW, building.y + halfH],
        ]
        const isField = building.kind === 'field'
        L.polygon(
          corners.map(([x, y]) => toLatLng(x, y)),
          {
            color: isField ? '#9FCF9A' : '#A9B6CC',
            weight: 1,
            fillColor: isField ? '#CDE8C5' : '#EEF1F6',
            fillOpacity: 1,
            interactive: false,
          },
        ).addTo(map)
      }

      const nextElements: Record<string, HTMLElement> = {}
      for (const place of PLACES) {
        const marker = L.marker(toLatLng(place.x, place.y), {
          icon: L.divIcon({ className: 'naver-poi', html: '', iconSize: [0, 0] }),
          interactive: false,
          keyboard: false,
          zIndexOffset: place.id === HOME.id ? 500 : place.kind === 'school' ? 100 : 0,
        }).addTo(map)
        markersRef.current[place.id] = marker
        const element = marker.getElement()
        if (element) nextElements[place.id] = element
      }

      overlayRef.current = L.layerGroup().addTo(map)

      map.on('zoomend', () => map && handlers.current.onZoomChange(map.getZoom()))
      map.on('click', (event) => {
        const target = event.originalEvent.target as HTMLElement | null
        if (!target?.closest('[data-poi]')) handlers.current.onBackground()
      })

      mapRef.current = map
      setElements(nextElements)
      setLeaflet(L)
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markersRef.current = {}
      overlayRef.current = null
    }
  }, [mapRef])

  useEffect(() => {
    if (active) mapRef.current?.invalidateSize()
  }, [active, mapRef])

  useEffect(() => {
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const base = id === HOME.id ? 500 : 0
      marker.setZIndexOffset(id === selectedId ? 1000 : base)
    }
  }, [selectedId, leaflet])

  useEffect(() => {
    const group = overlayRef.current
    if (!leaflet || !group) return
    group.clearLayers()

    if (route) {
      const latLngs = route.points.map(([x, y]) => toLatLng(x, y))
      const colors = ROUTE_COLORS[route.mode]
      if (route.mode === 'walk') {
        leaflet
          .polyline(latLngs, { color: colors.line, weight: 6, dashArray: '1 11', lineCap: 'round', interactive: false })
          .addTo(group)
      } else {
        leaflet.polyline(latLngs, { color: colors.outline, weight: 10, lineJoin: 'round', interactive: false }).addTo(group)
        leaflet.polyline(latLngs, { color: colors.line, weight: 6, lineJoin: 'round', interactive: false }).addTo(group)
      }
      leaflet
        .circleMarker(latLngs[0], { radius: 6, color: colors.outline, weight: 3, fillColor: '#FFFFFF', fillOpacity: 1, interactive: false })
        .addTo(group)
    }

    if (navPoint) {
      leaflet
        .marker(toLatLng(...navPoint), {
          interactive: false,
          keyboard: false,
          zIndexOffset: 2000,
          icon: leaflet.divIcon({
            className: 'naver-poi',
            iconSize: [0, 0],
            html: '<span style="position:absolute;left:-17px;top:-17px;width:34px;height:34px;border-radius:9999px;background:#03C75A;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>',
          }),
        })
        .addTo(group)
    }
  }, [leaflet, route, navPoint])

  return (
    <div className="absolute inset-0 isolate">
      <div ref={containerRef} className="size-full [&.leaflet-container]:!bg-white [&_.leaflet-control-attribution]:!bg-white/70 [&_.leaflet-control-attribution]:!text-[9px]" />
      {PLACES.map((place) => {
        const element = elements[place.id]
        if (!element) return null
        return createPortal(
          <Pin
            place={place}
            zoom={zoom}
            selected={place.id === selectedId}
            hidden={place.id === HOME.id && navPoint !== null}
            onSelect={onSelect}
          />,
          element,
          place.id,
        )
      })}
    </div>
  )
}

type PinProps = {
  place: Place
  zoom: number
  selected: boolean
  hidden: boolean
  onSelect: (id: string) => void
}

function Pin({ place, zoom, selected, hidden, onSelect }: PinProps) {
  if (hidden) return null
  const isHome = place.id === HOME.id
  const isUnion = place.id === 'union'
  const showIcon = selected || ALWAYS_VISIBLE.has(place.id) || zoom >= ICON_ZOOM || (isUnion && zoom >= 13)
  if (!showIcon) return null
  const showLabel = selected || zoom >= LABEL_ZOOM || (place.kind === 'school' && zoom >= ICON_ZOOM) || (isUnion && zoom >= 13)
  const label = isUnion && zoom < ICON_ZOOM ? '소원대학교' : place.name

  return (
    <button
      type="button"
      data-poi
      aria-label={`${place.name} (${place.dong})`}
      aria-pressed={selected}
      onClick={() => onSelect(place.id)}
      style={{ pointerEvents: 'auto' }}
      className={cn(
        'absolute left-0 top-0 flex -translate-x-1/2 items-center justify-center font-sans',
        selected ? '-translate-y-full' : '-translate-y-1/2',
      )}
    >
      {selected ? (
        <span className="mb-0.5 flex size-9 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-2 border-white bg-[#03C75A] shadow-md">
          <PlaceIcon kind={place.kind} className="size-5 rotate-45 bg-transparent" iconClassName="size-3.5" />
        </span>
      ) : isHome ? (
        <span className="size-4 rounded-full border-[3px] border-white bg-[#2F7BF5] shadow ring-[9px] ring-[#2F7BF5]/20" />
      ) : (
        <PlaceIcon kind={place.kind} className="size-[22px] border-[1.5px] border-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]" iconClassName="size-3" />
      )}
      {showLabel && (
        <span
          className={cn(
            'absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap text-center text-[12px] font-bold leading-tight [text-shadow:0_0_2px_#fff,0_0_3px_#fff,0_0_4px_#fff,0_0_5px_#fff]',
            selected ? 'text-[#02873D]' : isHome ? 'text-[#2F7BF5]' : KIND_STYLES[place.kind].text,
          )}
        >
          {label}
        </span>
      )}
    </button>
  )
}
