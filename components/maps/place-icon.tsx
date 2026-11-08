import {
  BedDouble,
  Coffee,
  Croissant,
  GraduationCap,
  Home,
  Landmark,
  MapPin,
  Martini,
  Mic2,
  Monitor,
  Pill,
  ShoppingBag,
  TrainFront,
  Trees,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KIND_LABELS, type PlaceKind } from './map-data'

const STYLE = {
  home: { bg: 'bg-[#03C75A]', text: 'text-[#03A64B]', Icon: Home },
  cafe: { bg: 'bg-[#E8833A]', text: 'text-[#C9681F]', Icon: Coffee },
  school: { bg: 'bg-[#5B7FDB]', text: 'text-[#4061B8]', Icon: GraduationCap },
  area: { bg: 'bg-[#8E63CE]', text: 'text-[#6B3FA0]', Icon: MapPin },
  motel: { bg: 'bg-[#D9568E]', text: 'text-[#B0306F]', Icon: BedDouble },
  bar: { bg: 'bg-[#E8833A]', text: 'text-[#C9681F]', Icon: Martini },
  restaurant: { bg: 'bg-[#E8833A]', text: 'text-[#C9681F]', Icon: UtensilsCrossed },
  friend: { bg: 'bg-[#16A085]', text: 'text-[#117A65]', Icon: UserRound },
  pc: { bg: 'bg-[#7C5CD6]', text: 'text-[#5E40B8]', Icon: Monitor },
  store: { bg: 'bg-[#3AA757]', text: 'text-[#2A8443]', Icon: ShoppingBag },
  bakery: { bg: 'bg-[#E8833A]', text: 'text-[#C9681F]', Icon: Croissant },
  bank: { bg: 'bg-[#6E80C9]', text: 'text-[#4E60A8]', Icon: Landmark },
  karaoke: { bg: 'bg-[#D9568E]', text: 'text-[#B0306F]', Icon: Mic2 },
  park: { bg: 'bg-[#4CAF6A]', text: 'text-[#2E8A4C]', Icon: Trees },
  pharmacy: { bg: 'bg-[#E25B5B]', text: 'text-[#C03C3C]', Icon: Pill },
  subway: { bg: 'bg-[#3B9F3B]', text: 'text-[#2B7F2B]', Icon: TrainFront },
} satisfies Record<PlaceKind, unknown>

export const KIND_STYLES = Object.fromEntries(
  Object.entries(STYLE).map(([kind, style]) => [kind, { ...style, label: KIND_LABELS[kind as PlaceKind] }]),
) as Record<PlaceKind, (typeof STYLE)[PlaceKind] & { label: string }>

export function PlaceIcon({ kind, className, iconClassName }: { kind: PlaceKind; className?: string; iconClassName?: string }) {
  const { bg, Icon } = STYLE[kind]
  return (
    <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-full text-white', bg, className)}>
      <Icon className={cn('size-4', iconClassName)} />
    </span>
  )
}
