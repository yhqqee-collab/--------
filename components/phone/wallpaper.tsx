import Image from 'next/image'

export function Wallpaper({ dim = false }: { dim?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-white">
      <Image
        src="/images/wallpaper-doodle.png"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 100vw, 402px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/25" />
      {dim && <div className="absolute inset-0 bg-black/25" />}
    </div>
  )
}
