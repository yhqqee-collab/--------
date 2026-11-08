import type { CSSProperties } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

type AvatarProps = {
  src?: string
  name: string
  size: number
  className?: string
  style?: CSSProperties
}

/** 프로필 사진의 얼굴 위치를 미세 조정할 때 사용합니다. 예: { '/profiles/a.jpg': { objectPosition: '50% 30%' } } */
const FACE_FRAMING: Record<string, CSSProperties> = {}

export function Avatar({ src, name, size, className, style }: AvatarProps) {
  return (
    <span
      className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-[38%] bg-[#9BB6D3]', className)}
      style={{ width: size, height: size, ...style }}
    >
      {src ? (
        <Image
          src={src}
          alt={`${name} 프로필 사진`}
          fill
          sizes={`${size}px`}
          className="object-cover"
          style={FACE_FRAMING[src]}
        />
      ) : (
        <User
          role="img"
          aria-label={`${name} 기본 프로필`}
          className="text-white"
          style={{ width: size * 0.6, height: size * 0.6 }}
          strokeWidth={1.6}
          fill="currentColor"
        />
      )}
    </span>
  )
}
