import { BedDouble, Coffee, GraduationCap, Home, MapPin, Martini, UserRound, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaceKind } from './map-data'

export const KIND_STYLES = {
  home: { bg: 'bg-[#1A73E8]', text: 'text-[#1A73E8]', Icon: Home, label: '집' },
  cafe: { bg: 'bg-[#E8710A]', text: 'text-[#B45309]', Icon: Coffee, label: '카페' },
  school: { bg: 'bg-[#129EAF]', text: 'text-[#0E7C8A]', Icon: GraduationCap, label: '대학교' },
  area: { bg: 'bg-[#8E63CE]', text: 'text-[#6B3FA0]', Icon: MapPin, label: '지역' },
  motel: { bg: 'bg-[#D93F8E]', text: 'text-[#B0306F]', Icon: BedDouble, label: '숙박' },
  bar: { bg: 'bg-[#5B4CC4]', text: 'text-[#4637A8]', Icon: Martini, label: '바' },
  restaurant: { bg: 'bg-[#E8710A]', text: 'text-[#B45309]', Icon: UtensilsCrossed, label: '레스토랑' },
  friend: { bg: 'bg-[#188038]', text: 'text-[#137333]', Icon: UserRound, label: '지인 집' },
} satisfies Record<PlaceKind, unknown>

export function PlaceIcon({ kind, className, iconClassName }: { kind: PlaceKind; className?: string; iconClassName?: string }) {
  const { bg, Icon } = KIND_STYLES[kind]
  return (
    <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-full text-white', bg, className)}>
      <Icon className={cn('size-4', iconClassName)} />
    </span>
  )
}
