import Image from 'next/image'

export function Wallpaper({ dim = false }: { dim?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#f7f5f2]">
      <Image
        src="/images/wallpaper-stars.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 100vw, 402px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/20" />
      {dim && <div className="absolute inset-0 bg-black/25" />}
    </div>
  )
}
