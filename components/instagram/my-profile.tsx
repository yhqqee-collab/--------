'use client'

import Image from 'next/image'
import { AtSign, ChevronDown, Copy, Grid3x3, LockKeyhole, Menu, SquarePlus, SquareUser } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MY_AVATAR, MY_PROFILE, type Post } from './instagram-data'

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[16px] font-semibold">{value.toLocaleString('ko-KR')}</span>
      <span className="text-[13px]">{label}</span>
    </div>
  )
}

export function MyProfile({
  open,
  handle,
  name,
  posts,
  onOpenPost,
  onOpenStory,
  hasStory = false,
}: {
  open: boolean
  handle: string
  name: string
  posts: Post[]
  onOpenPost: (index: number) => void
  onOpenStory: () => void
  hasStory?: boolean
}) {
  return (
    <section
      aria-label="내 프로필"
      aria-hidden={!open}
      inert={!open}
      className={cn('absolute inset-x-0 top-0 bottom-[66px] z-[25] flex flex-col bg-white text-black', !open && 'hidden')}
    >
      <header className="flex shrink-0 items-center gap-[6px] px-[16px] pb-[8px] pt-[54px]">
        <LockKeyhole className="size-[15px]" strokeWidth={2.4} aria-hidden />
        <h2 className="flex min-w-0 flex-1 items-center gap-[4px] text-[22px] font-bold">
          <span className="truncate">{handle}</span>
          <ChevronDown className="size-[18px] shrink-0" strokeWidth={2.4} aria-hidden />
        </h2>
        <AtSign className="size-[24px]" strokeWidth={1.9} aria-label="Threads" />
        <SquarePlus className="ml-[18px] size-[25px]" strokeWidth={1.9} aria-label="만들기" />
        <Menu className="ml-[18px] size-[26px]" strokeWidth={1.9} aria-label="메뉴" />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-center gap-[24px] px-[16px] pt-[6px]">
          <button
            type="button"
            onClick={hasStory ? onOpenStory : undefined}
            disabled={!hasStory}
            aria-label={hasStory ? '내 스토리 보기' : '프로필 사진'}
            className="shrink-0 rounded-full"
          >
            <span
              className={cn(
                'flex size-[92px] items-center justify-center rounded-full p-[3px]',
                hasStory && 'bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]',
              )}
            >
              <span className="flex size-full rounded-full bg-white p-[3px]">
                <Image src={MY_AVATAR} alt="" width={80} height={80} className="size-full rounded-full object-cover" />
              </span>
            </span>
          </button>
          <div className="flex flex-1 flex-col gap-[6px]">
            <p className="text-[15px] font-semibold">{name}</p>
            <div className="flex justify-between pr-[8px]">
              <Stat value={posts.length} label="게시물" />
              <Stat value={MY_PROFILE.followers} label="팔로워" />
              <Stat value={MY_PROFILE.following} label="팔로잉" />
            </div>
          </div>
        </div>

        {MY_PROFILE.bio && <p className="whitespace-pre-line px-[16px] pt-[12px] text-[13px] leading-[18px]">{MY_PROFILE.bio}</p>}

        <div className="flex gap-[6px] px-[16px] pt-[14px]">
          <button type="button" className="h-[34px] flex-1 rounded-[8px] bg-[#EFEFEF] text-[14px] font-semibold active:bg-[#DBDBDB]">
            프로필 편집
          </button>
          <button type="button" className="h-[34px] flex-1 rounded-[8px] bg-[#EFEFEF] text-[14px] font-semibold active:bg-[#DBDBDB]">
            프로필 공유
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

        <ul aria-label="내 게시물" className="grid grid-cols-3 gap-[2px] pb-[20px]">
          {posts.map((post, index) => (
            <li key={post.id} className="relative aspect-[3/4] bg-[#EFEFEF]">
              <button type="button" onClick={() => onOpenPost(index)} className="absolute inset-0 z-[1]" aria-label={`게시물 ${index + 1} 보기`} />
              <Image src={post.images[0].src} alt={post.images[0].alt} fill sizes="134px" className="object-cover" />
              {post.images.length > 1 && (
                <Copy className="absolute right-[6px] top-[6px] size-[16px] text-white drop-shadow" strokeWidth={2.2} aria-label="여러 장" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
