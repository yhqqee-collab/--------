import { Navigation } from 'lucide-react'
import { useEffect, useRef, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import {
  AREA_GROUP,
  BASE_HEIGHT as MAP_BASE_HEIGHT,
  BASE_WIDTH as MAP_BASE_WIDTH,
  DISTRICT_LABELS,
  DISTRICTS,
  MAP_HEIGHT,
  MAP_SCALE,
  MAP_WIDTH,
  PLACES,
  type TravelModeId,
} from './map-data'
import { HOME, type Point } from './map-utils'
import { KIND_STYLES, PlaceIcon } from './place-icon'

const MINOR_ROADS = [
  'M0,150 H960',
  'M0,700 H960',
  'M0,1000 H960',
  'M120,0 V1180',
  'M380,0 V1180',
  'M860,0 V1180',
  ...PLACES.flatMap((place) => [`M0,${place.y} H960`, `M${place.x},0 V1180`]),
]

const MAIN_ROADS = ['M0,630 C300,590 640,690 960,600', 'M620,0 C590,380 680,760 640,1180']

type MapCanvasProps = {
  scrollRef: RefObject<HTMLDivElement | null>
  zoom: number
  selectedId: string | null
  route: { points: Point[]; mode: TravelModeId } | null
  navPoint: Point | null
  onZoom: (next: number, anchorX: number, anchorY: number) => void
  onSelect: (id: string) => void
  onBackground: () => void
}

export function MapCanvas({ scrollRef, zoom, selectedId, route, navPoint, onZoom, onSelect, onBackground }: MapCanvasProps) {
  const polyline = route?.points.map((point) => point.join(',')).join(' ')
  const zoomRef = useRef(zoom)
  const onZoomRef = useRef(onZoom)

  useEffect(() => {
    zoomRef.current = zoom
    onZoomRef.current = onZoom
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let pinch: { distance: number; zoom: number } | null = null

    // The phone frame may be CSS-scaled, so convert screen px to the element's own px.
    const toLocal = (clientX: number, clientY: number): [number, number] => {
      const rect = el.getBoundingClientRect()
      const ratio = el.clientWidth / rect.width || 1
      return [(clientX - rect.left) * ratio, (clientY - rect.top) * ratio]
    }
    const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) pinch = { distance: distance(event.touches), zoom: zoomRef.current }
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (!pinch || event.touches.length !== 2) return
      event.preventDefault()
      const [t0, t1] = [event.touches[0], event.touches[1]]
      const [ax, ay] = toLocal((t0.clientX + t1.clientX) / 2, (t0.clientY + t1.clientY) / 2)
      onZoomRef.current((pinch.zoom * distance(event.touches)) / pinch.distance, ax, ay)
    }
    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinch = null
    }
    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return
      event.preventDefault()
      const [ax, ay] = toLocal(event.clientX, event.clientY)
      onZoomRef.current(zoomRef.current * Math.exp(-event.deltaY * 0.01), ax, ay)
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('touchcancel', handleTouchEnd)
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
      el.removeEventListener('wheel', handleWheel)
    }
  }, [scrollRef])

  const pos = (x: number, y: number) => ({ left: x * zoom * MAP_SCALE, top: y * zoom * MAP_SCALE })
  const width = MAP_WIDTH * zoom
  const height = MAP_HEIGHT * zoom

  return (
    <div
      ref={scrollRef}
      className="absolute inset-0 touch-pan-x touch-pan-y overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex min-h-full min-w-full items-center justify-center" style={{ width, height }}>
      <div
        className="relative shrink-0"
        style={{ width, height }}
        onClick={onBackground}
        onDoubleClick={(event) => {
          const el = scrollRef.current
          if (!el) return
          const rect = el.getBoundingClientRect()
          const ratio = el.clientWidth / rect.width || 1
          onZoom(zoom * 1.6, (event.clientX - rect.left) * ratio, (event.clientY - rect.top) * ratio)
        }}
      >
        <svg aria-hidden width={width} height={height} viewBox={`0 0 ${MAP_BASE_WIDTH} ${MAP_BASE_HEIGHT}`} className="absolute inset-0">
          <defs>
            <pattern id="gmap-blocks" width="56" height="56" patternUnits="userSpaceOnUse">
              <rect x="7" y="7" width="42" height="42" rx="4" fill="#000000" fillOpacity={0.045} />
            </pattern>
          </defs>
          <rect width={MAP_BASE_WIDTH} height={MAP_BASE_HEIGHT} fill="#F1F3F4" />

          {DISTRICTS.map((district) => (
            <polygon key={district.name} points={district.points} fill={district.fill} />
          ))}
          <rect width={MAP_BASE_WIDTH} height={MAP_BASE_HEIGHT} fill="url(#gmap-blocks)" />

          <ellipse cx="840" cy="500" rx="90" ry="60" fill="#CEEAD6" />
          <ellipse cx="140" cy="590" rx="75" ry="45" fill="#CEEAD6" />
          <ellipse cx="580" cy="930" rx="85" ry="42" fill="#CEEAD6" />
          <rect x="640" y="180" width="170" height="150" rx="20" fill="#F3E8D8" />
          <ellipse cx="110" cy="180" rx="80" ry="55" fill="#AECBFA" />
          <path d="M-20,1085 C250,1010 560,1145 980,1050" fill="none" stroke="#AECBFA" strokeWidth="46" />

          {MINOR_ROADS.map((d, index) => (
            <path key={`minor-${index}`} d={d} fill="none" stroke="#FFFFFF" strokeWidth={9} />
          ))}
          {MAIN_ROADS.map((d, index) => (
            <g key={`main-${index}`}>
              <path d={d} fill="none" stroke="#F2C14E" strokeWidth={19} />
              <path d={d} fill="none" stroke="#FDE293" strokeWidth={15} />
            </g>
          ))}

          {DISTRICTS.map((district) => (
            <polygon
              key={district.name}
              points={district.points}
              fill="none"
              stroke="#80868B"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              strokeDasharray="6 5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={AREA_GROUP.path}
            fill="#8E63CE"
            fillOpacity={0.06}
            stroke="#8E63CE"
            strokeOpacity={0.75}
            strokeWidth={2.5}
            strokeDasharray="10 6"
            vectorEffect="non-scaling-stroke"
          />

          {polyline &&
            (route?.mode === 'walk' ? (
              <polyline
                points={polyline}
                fill="none"
                stroke="#1A73E8"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="0.1 14"
              />
            ) : (
              <>
                <polyline points={polyline} fill="none" stroke="#1967D2" strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
                <polyline
                  points={polyline}
                  fill="none"
                  stroke={route?.mode === 'transit' ? '#34A853' : '#4285F4'}
                  strokeWidth={8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ))}
          {route && (
            <circle cx={route.points[0][0]} cy={route.points[0][1]} r={7} fill="#FFFFFF" stroke="#1967D2" strokeWidth={4} />
          )}
        </svg>

        {DISTRICT_LABELS.map((label) => (
          <span
            key={label.name}
            aria-hidden
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[15px] font-semibold tracking-[0.25em] text-[#5F6368] [text-shadow:0_0_3px_#fff,0_0_3px_#fff]"
            style={pos(label.x, label.y)}
          >
            {label.name}
          </span>
        ))}

        {!navPoint && (
          <span
            aria-hidden
            className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1A73E8] shadow ring-[10px] ring-[#1A73E8]/20"
            style={pos(HOME.x, HOME.y)}
          />
        )}

        {PLACES.map((place) => {
          const selected = place.id === selectedId
          if (place.kind === 'area' && !selected) return null
          return (
            <button
              key={place.id}
              type="button"
              aria-label={`${place.name} (${place.dong})`}
              aria-pressed={selected}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(place.id)
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
              style={pos(place.x, place.y)}
            >
              {selected ? (
                <span className="mb-1.5 flex size-8 -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] bg-[#EA4335] shadow-md">
                  <span className="size-3 rounded-full bg-[#B31412]" />
                </span>
              ) : (
                <>
                  <PlaceIcon
                    kind={place.kind}
                    className={cn('border-2 border-white shadow-md', place.kind === 'area' ? 'size-6' : 'size-8')}
                    iconClassName={place.kind === 'area' ? 'size-3' : 'size-4'}
                  />
                  <span className="h-2 w-0.5 bg-[#5F6368]" />
                </>
              )}
              <span className="absolute left-full top-1/4 ml-0.5 flex flex-col items-start gap-0.5">
                <span
                  className={cn(
                    'whitespace-nowrap text-[13px] font-semibold leading-tight [text-shadow:0_0_2px_#fff,0_0_3px_#fff,0_0_4px_#fff]',
                    selected ? 'text-[#C5221F]' : KIND_STYLES[place.kind].text,
                  )}
                >
                  {place.name}
                </span>
              </span>
            </button>
          )
        })}

        {navPoint && (
          <span
            aria-hidden
            className="absolute z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-[#1A73E8] shadow-lg transition-[left,top] duration-700"
            style={pos(navPoint[0], navPoint[1])}
          >
            <Navigation className="size-4 fill-white text-white" />
          </span>
        )}
      </div>
      </div>
    </div>
  )
}
