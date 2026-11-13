import Image from 'next/image'
import { TrendingUp } from 'lucide-react'
import { NaverMapLogo } from '@/components/maps/naver-map-logo'

function IconImage({ src }: { src: string }) {
  return <Image src={src} alt="" fill sizes="60px" className="object-cover" />
}

export function DuolingoArt() {
  return <IconImage src="/images/icons/duolingo.png" />
}

export function AblyArt() {
  return (
    <span className="relative block size-full bg-white">
      <IconImage src="/images/icons/ably.png" />
    </span>
  )
}

export function NaverMapArt() {
  return (
    <span className="flex size-full items-center justify-center bg-white">
      <NaverMapLogo className="size-[70%]" />
    </span>
  )
}

export function BaeminArt() {
  return <IconImage src="/images/icons/baemin.png" />
}

export function WeverseArt() {
  return <IconImage src="/images/icons/weverse.jpeg" />
}

export function EverytimeArt() {
  return (
    <span className="relative block size-full bg-white">
      <IconImage src="/images/icons/everytime.png" />
    </span>
  )
}

export function StockArt() {
  return (
    <span className="flex size-full flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-[#6B2BD9] to-[#C2185B]">
      <TrendingUp aria-hidden className="size-7 text-white" strokeWidth={2.6} />
      <span className="text-[9px] font-bold tracking-wide text-white/90">MTS</span>
    </span>
  )
}
