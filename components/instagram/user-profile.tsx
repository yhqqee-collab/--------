'use client'

import Image from 'next/image'
import { ChevronLeft, Copy, Grid3x3, MoreHorizontal, SquareUser } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProfileTile = { src: string; alt: string; multiple?: boolean }

export type UserProfileData = {
  handle: string
  name: string
  bio?: string
  bioTag?: string
  avatar?: string
  followers: number
  following: number
  tiles: ProfileTile[]
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[16px] font-semibold">{value.toLocaleString('ko-KR')}</span>
      <span className="text-[13px]">{label}</span>
    </div>
  )
}

export function UserProfile({ profile, onClose, onOpenPost, onOpenStory, onMessage, storyState = 'none' }: { profile: UserProfileData | null; onClose: () => void; onOpenPost?: (handle: string, index: number) => void; onOpenStory?: (handle: string) => void; onMessage?: (handle: string) => void; storyState?: 'none' | 'unseen' | 'seen' }) {
  const open = profile !== null
  const hasStory = storyState !== 'none'

  return (
    <section
      aria-label={profile ? `${profile.handle} 프로필` : undefined}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-30 flex flex-col bg-white text-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full',
      )}
    >
      {profile && (
        <>
          <header className="flex shrink-0 items-center gap-[4px] px-[4px] pb-[6px] pt-[54px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="뒤로 가기"
              className="flex size-[44px] items-center justify-center active:opacity-50"
            >
              <ChevronLeft className="size-[28px]" strokeWidth={2} />
            </button>
            <h2 className="flex-1 truncate text-[18px] font-bold">{profile.handle}</h2>
            <MoreHorizontal className="mr-[12px] size-[22px]" aria-hidden />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
            <div className="flex items-center gap-[24px] px-[16px] pt-[6px]">
              <button type="button" onClick={hasStory ? () => onOpenStory?.(profile.handle) : undefined} disabled={!hasStory} className="shrink-0 rounded-full" aria-label={hasStory ? `${profile.handle} 스토리 보기` : `${profile.handle} 프로필 사진`}>
              <span
                className={cn(
                  'flex size-[104px] shrink-0 items-center justify-center rounded-full p-[3px]',
                  storyState === 'unseen' && 'bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]',
                  storyState === 'seen' && 'bg-[#DBDBDB]',
                )}
              >
                <span className="flex size-full items-center justify-center rounded-full bg-white p-[3px]">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt="" width={92} height={92} className="size-full rounded-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center rounded-full bg-[#efefef] text-[22px] text-black/30">{profile.name.slice(-1)}</span>
                  )}
                </span>
              </span>
              </button>
              <div className="flex flex-1 flex-col gap-[6px]">
                <p className="text-[15px] font-semibold">{profile.name}</p>
                <div className="flex justify-between pr-[8px]">
                  <Stat value={profile.tiles.length} label="게시물" />
                  <Stat value={profile.followers} label="팔로워" />
                  <Stat value={profile.following} label="팔로잉" />
                </div>
              </div>
            </div>

            {(profile.bio || profile.bioTag) && (
              <p className="px-[16px] pt-[12px] text-[13px] leading-[18px] whitespace-pre-line">
                {profile.bioTag && <span className="block font-semibold text-[#1877f2]">{profile.bioTag}</span>}
                {profile.bio}
              </p>
            )}

            <div className="flex gap-[6px] px-[16px] pt-[14px]">
              <button
                type="button"
                className="h-[34px] flex-1 rounded-[8px] bg-[#EFEFEF] text-[14px] font-semibold active:bg-[#DBDBDB]"
              >
                팔로잉
              </button>
            </div>

            <div className="mt-[14px] flex border-b border-black/[0.08]">
              <span className="flex h-[44px] flex-1 items-center justify-center border-b border-black">
                <Grid3x3 className="size-[24px]" strokeWidth={1.9} aria-label="게시물" />
              </span>
              <span className="flex h-[44px] flex-1 items-center justify-center text-[#737373]">
                <SquareUser className="size-[24px]" strokeWidth={1.9} aria-label="태그됨" />
              </span>
            </div>

            <ul aria-label="게시물" className="grid grid-cols-3 gap-[2px] pb-[30px]">
              {profile.tiles.map((tile, index) => (
                <li key={`${tile.src}-${index}`} className="relative aspect-[3/4] bg-[#EFEFEF]">
                  <button type="button" onClick={() => onOpenPost?.(profile.handle, index)} className="absolute inset-0 z-[1]" aria-label={`${profile.handle} 게시물 ${index + 1} 보기`} />
                  <Image src={tile.src} alt={tile.alt} fill sizes="134px" className="object-cover" />
                  {tile.multiple && (
                    <Copy
                      className="absolute right-[6px] top-[6px] size-[16px] text-white drop-shadow"
                      strokeWidth={2.2}
                      aria-label="여러 장"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}
