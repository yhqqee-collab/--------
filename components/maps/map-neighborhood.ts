import type { Point } from './map-utils'

export type MapShape = { points: Point[]; fill: string; stroke: string }

const EXTENT = 1800
const CELL_X = 150
const CELL_Y = 140
const ORIGIN_X = -300
const ORIGIN_Y = 250
const MINOR_ROAD = 12
const MAJOR_ROAD = 30
// Matches CAMPUS_IMAGE bounds so blocks run right up to (and under) the campus art with no gaps.
const CAMPUS_BOX = { minX: -366, maxX: 318, minY: -277.5, maxY: 297 }
const RIVER_X = -1000
const RIVER_HALF = 55

const COLORS = {
  lot: { fill: '#EEEDEA', stroke: '#DEDCD7' },
  apartment: { fill: '#F2EADF', stroke: '#E3D6C4' },
  park: { fill: '#D9EECB', stroke: '#C5E2B2' },
  river: { fill: '#A9D3F5', stroke: '#A9D3F5' },
  bank: { fill: '#E3F0D8', stroke: '#E3F0D8' },
}

function hash(a: number, b: number) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function rect(x1: number, y1: number, x2: number, y2: number): Point[] {
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ]
}

function roadLines(origin: number, cell: number, majorEvery: number) {
  const lines: { at: number; width: number }[] = []
  const start = Math.floor((-EXTENT - origin) / cell)
  const end = Math.ceil((EXTENT - origin) / cell)
  for (let k = start; k <= end; k++) {
    lines.push({ at: origin + k * cell, width: k % majorEvery === 0 ? MAJOR_ROAD : MINOR_ROAD })
  }
  return lines
}

function overlapsCampus(x1: number, y1: number, x2: number, y2: number) {
  return x1 >= CAMPUS_BOX.minX && x2 <= CAMPUS_BOX.maxX && y1 >= CAMPUS_BOX.minY && y2 <= CAMPUS_BOX.maxY
}

function riverOffset(y: number) {
  return Math.sin(y / 380) * 90
}

function overlapsRiver(x1: number, x2: number, y1: number, y2: number) {
  const margin = RIVER_HALF + 40
  return [y1, y2].some((y) => {
    const center = RIVER_X + riverOffset(y)
    return x2 > center - margin && x1 < center + margin
  })
}

function buildRiver(): MapShape[] {
  const left: Point[] = []
  const right: Point[] = []
  for (let y = -EXTENT; y <= EXTENT; y += 60) {
    const center = RIVER_X + riverOffset(y)
    left.push([center - RIVER_HALF, y])
    right.unshift([center + RIVER_HALF, y])
  }
  const bankLeft = left.map(([x, y]): Point => [x - 25, y])
  const bankRight = right.map(([x, y]): Point => [x + 25, y])
  return [
    { points: [...bankLeft, ...bankRight], ...COLORS.bank },
    { points: [...left, ...right], ...COLORS.river },
  ]
}

function buildBlocks(): MapShape[] {
  const shapes: MapShape[] = []
  const xs = roadLines(ORIGIN_X, CELL_X, 4)
  const ys = roadLines(ORIGIN_Y, CELL_Y, 4)

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x1 = xs[i].at + xs[i].width / 2
      const x2 = xs[i + 1].at - xs[i + 1].width / 2
      const y1 = ys[j].at + ys[j].width / 2
      const y2 = ys[j + 1].at - ys[j + 1].width / 2
      if (overlapsCampus(x1, y1, x2, y2) || overlapsRiver(x1, x2, y1, y2)) continue

      const roll = hash(i, j)
      if (roll < 0.06) {
        shapes.push({ points: rect(x1, y1, x2, y2), ...COLORS.park })
        continue
      }
      if (roll < 0.16) {
        shapes.push({ points: rect(x1, y1, x2, y2), ...COLORS.apartment })
        continue
      }

      const gap = 4
      const midX = x1 + (x2 - x1) * (0.4 + hash(j, i) * 0.2)
      const midY = y1 + (y2 - y1) * 0.5
      const lots = [
        rect(x1, y1, midX - gap / 2, midY - gap / 2),
        rect(midX + gap / 2, y1, x2, midY - gap / 2),
        rect(x1, midY + gap / 2, midX - gap / 2, y2),
        rect(midX + gap / 2, midY + gap / 2, x2, y2),
      ]
      for (const points of lots) shapes.push({ points, ...COLORS.lot })
    }
  }
  return shapes
}

export const NEIGHBORHOOD_SHAPES: MapShape[] = [...buildRiver(), ...buildBlocks()]
export const NEIGHBORHOOD_MIN_ZOOM = 13
