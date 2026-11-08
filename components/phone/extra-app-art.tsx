import Image from 'next/image'
import { Sparkles, TrendingUp } from 'lucide-react'

export function FortuneArt() {
  return (
    <span className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-800 to-fuchsia-700">
      <Sparkles aria-hidden className="size-7 text-yellow-200" strokeWidth={2.2} />
    </span>
  )
}

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

export function GoogleMapsArt() {
  return (
    <span className="relative block size-full bg-white">
      <Image src="/images/icons/google-maps.jpeg" alt="" fill sizes="60px" className="object-contain p-2" />
    </span>
  )
}

export function WeverseArt() {
  return <IconImage src="/images/icons/weverse.jpeg" />
}

export function TikTokArt() {
  return <IconImage src="/images/icons/tiktok.png" />
}

export function StockArt() {
  return (
    <span className="flex size-full flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-[#6B2BD9] to-[#C2185B]">
      <TrendingUp aria-hidden className="size-7 text-white" strokeWidth={2.6} />
      <span className="text-[9px] font-bold tracking-wide text-white/90">MTS</span>
    </span>
  )
}
