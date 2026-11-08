'use client'

import Image from 'next/image'
import { Grand_Hotel } from 'next/font/google'
import { Bookmark, ChevronLeft, Clapperboard, Heart, House, MessageCircle, MoreHorizontal, Search, Send, SquarePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CommentsSheet, type PostComment } from './comments-sheet'
import { FriendStoryViewer, type FriendStory } from './friend-story-viewer'
import { MyProfile } from './my-profile'
import { UserProfile } from './user-profile'
import {
  ALL_POSTS,
  COMMENT_AVATARS,
  DEFAULT_AVATAR,
  MY_AVATAR,
  MY_HANDLE,
  MY_POSTS,
  NOTIFICATION_COMMENT,
  POSTS,
  PROFILES,
  shiftTime,
  storiesForDay,
  type Post,
} from './instagram-data'

const logoFont = Grand_Hotel({ weight: '400', subsets: ['latin'] })

function findPost(id: string) {
  return ALL_POSTS.find((post) => post.id === id)
}

function LikedBy({ post, liked }: { post: Post; liked: boolean }) {
  const first = post.likedBy?.[0]
  const total = post.likes + (liked ? 1 : 0)
  if (!first) return <p className="font-semibold">좋아요 {total.toLocaleString('ko-KR')}개</p>
  return (
    <p className="flex items-center gap-[6px]">
      <span className="flex -space-x-[6px]" aria-hidden>
        {post.likedBy!.slice(0, 2).map((handle) => (
          <Image
            key={handle}
            src={COMMENT_AVATARS[handle] ?? DEFAULT_AVATAR}
            alt=""
            width={18}
            height={18}
            className="size-[18px] rounded-full object-cover ring-2 ring-white"
          />
        ))}
      </span>
      <span>
        <span className="font-semibold">{first}</span>님 외 <span className="font-semibold">{(total - 1).toLocaleString('ko-KR')}명</span>이 좋아합니다
      </span>
    </p>
  )
}

function PhotoCarousel({ images }: { images: Post['images'] }) {
  const [index, setIndex] = useState(0)
  const multiple = images.length > 1

  return (
    <>
      <div className="relative aspect-[4/5] w-full bg-[#EFEFEF]">
        <ul
          aria-label="게시물 사진"
          onScroll={(e) => {
            const el = e.currentTarget
            setIndex(Math.round(el.scrollLeft / el.clientWidth))
          }}
          className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]"
        >
          {images.map((image, i) => (
            <li key={`${image.src}-${i}`} className="relative size-full shrink-0 snap-center">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="400px"
                priority={i === 0}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        {multiple && (
          <span className="absolute right-[12px] top-[12px] rounded-full bg-black/60 px-[8px] py-[3px] text-[12px] font-medium text-white">
            {index + 1}/{images.length}
          </span>
        )}
      </div>
      {multiple && (
        <div aria-hidden className="flex justify-center gap-[4px] pt-[10px]">
          {images.map((image, i) => (
            <span
              key={`${image.src}-${i}`}
              className={cn('size-[6px] rounded-full transition-colors', i === index ? 'bg-[#0095F6]' : 'bg-black/20')}
            />
          ))}
        </div>
      )}
    </>
  )
}

type StoryState = 'none' | 'unseen' | 'seen'

function StoryRing({ children, seen = false, state }: { children: React.ReactNode; seen?: boolean; state?: StoryState }) {
  const ring = state ?? (seen ? 'seen' : 'unseen')
  return (
    <span
      className={cn(
        'rounded-full p-[2.5px]',
        ring === 'none' ? 'bg-transparent' : ring === 'seen' ? 'bg-[#DBDBDB]' : 'bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#962FBF]',
      )}
    >
      <span className="block rounded-full bg-white p-[2.5px]">{children}</span>
    </span>
  )
}

function PostCard({
  post,
  comments,
  onOpenComments,
  onOpenProfile,
  storyState = 'none',
}: {
  post: Post
  comments: PostComment[]
  onOpenComments: () => void
  onOpenProfile?: () => void
  storyState?: StoryState
}) {
  const [liked, setLiked] = useState(false)
  const multiple = post.images.length > 1

  return (
    <article className="pb-4">
      <header className="flex items-center gap-[10px] px-[12px] py-[10px]">
        <button
          type="button"
          onClick={onOpenProfile}
          disabled={!onOpenProfile}
          aria-label={`${post.handle} 프로필 보기`}
          className="flex min-w-0 flex-1 items-center gap-[10px] text-left active:opacity-60 disabled:active:opacity-100"
        >
          <StoryRing state={storyState}>
            {post.avatar ? (
              <Image src={post.avatar} alt="" width={30} height={30} className="size-[30px] rounded-full object-cover" />
            ) : (
              <span className="size-[30px] rounded-full bg-[#efefef]" aria-hidden />
            )}
          </StoryRing>
          <span className="min-w-0 flex-1 text-black">
            <span className="block truncate text-[14px]">
              <span className="font-semibold">{post.handle}</span>
              <span className="text-[#737373]"> • {post.time}</span>
            </span>
            {post.location && <span className="block truncate text-[12px] leading-tight">{post.location}</span>}
          </span>
        </button>
        <MoreHorizontal className="size-[20px] text-black" aria-hidden />
      </header>

      <PhotoCarousel images={post.images} />

      <div className={cn('flex items-center gap-[14px] px-[12px] text-black', multiple ? '-mt-[16px]' : 'pt-[10px]')}>
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? '좋아요 취소' : '좋아요'}
          aria-pressed={liked}
          className="-m-2 p-2 transition-transform active:scale-75"
        >
          <Heart
            className={cn('size-[25px] transition-colors', liked && 'fill-[#FF3040] text-[#FF3040]')}
            strokeWidth={1.9}
          />
        </button>
        {!post.commentsDisabled && (
          <button
            type="button"
            onClick={onOpenComments}
            aria-label="댓글 보기"
            className="-m-2 p-2 transition-transform active:scale-90"
          >
            <MessageCircle className="size-[24px] -scale-x-100" strokeWidth={1.9} />
          </button>
        )}
        <Send className="size-[23px]" strokeWidth={1.9} aria-hidden />
        <Bookmark className="ml-auto size-[24px]" strokeWidth={1.9} aria-hidden />
      </div>

      <div className="space-y-[3px] px-[12px] pt-[8px] text-[14px] leading-[1.35] text-black">
        <LikedBy post={post} liked={liked} />
        {post.caption && (
          <p>
            {onOpenProfile ? (
              <button type="button" onClick={onOpenProfile} className="font-semibold hover:underline">
                {post.handle}
              </button>
            ) : (
              <span className="font-semibold">{post.handle}</span>
            )}{' '}{post.caption}
          </p>
        )}
        {!post.commentsDisabled && (
          <>
            <button type="button" onClick={onOpenComments} className="block py-[2px] text-[#737373]">
              댓글 {comments.length}개 모두 보기
            </button>
            {comments.slice(0, 2).map((comment, i) => (
              <p key={i}>
                <span className="font-semibold">{comment.name}</span> {comment.text}
              </p>
            ))}
          </>
        )}
      </div>
    </article>
  )
}

export function InstagramApp({
  open,
  owner,
  ownerName,
  onOpenMyStory,
  onOpenCommentPost,
  autoOpenPostId,
  revealNotificationComment = false,
  hasMyStory = false,
  day = 1,
}: { 
  hasMyStory?: boolean
  day?: number
  open: boolean
  owner: string
  ownerName?: string
  onOpenMyStory: () => void
  onOpenCommentPost?: (postId: string) => void
  autoOpenPostId?: string | null
  revealNotificationComment?: boolean
}) {
  const initial = owner.slice(-2, -1) || owner.slice(0, 1)
  const ownerHandle = owner || 'yeoju'
  const elapsedDays = day - 1
  const withOwner = (post: Post): Post => ({
    ...post,
    handle: post.handle === MY_HANDLE ? ownerHandle : post.handle,
    time: shiftTime(post.time, elapsedDays),
  })
  const agedComments = (comments: PostComment[]) =>
    comments.map((comment) => ({ ...comment, time: shiftTime(comment.time, day - (comment.postedDay ?? 1)) }))
  const todayStories = storiesForDay(day)
  const seenKey = (handle: string) => `${day}:${handle}`
  const storyStateOf = (handle: string): StoryState => {
    if (!todayStories.some((item) => item.handle === handle && item.story)) return 'none'
    return seenStories.includes(seenKey(handle)) ? 'seen' : 'unseen'
  }
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>(() =>
    Object.fromEntries(
      ALL_POSTS.map((post) => [
        post.id,
        post.comments.map((comment) => (comment.name === MY_HANDLE ? { ...comment, name: ownerHandle } : comment)),
      ]),
    ),
  )
  const [activePost, setActivePost] = useState<string | null>(null)
  const [activeStory, setActiveStory] = useState<FriendStory | null>(null)
  const [seenStories, setSeenStories] = useState<string[]>([])
  const [activeProfile, setActiveProfile] = useState<string | null>(null)
  const [tab, setTab] = useState<'home' | 'profile'>('home')
  const [myFeedIndex, setMyFeedIndex] = useState<number | null>(null)
  useEffect(() => {
    if (open && autoOpenPostId) {
      setActivePost(autoOpenPostId)
      const notice = NOTIFICATION_COMMENT
      if (revealNotificationComment && notice && notice.postId === autoOpenPostId) {
        setCommentsByPost((prev) => {
          const current = prev[autoOpenPostId] ?? []
          if (current.some((comment) => comment.name === notice.comment.name && comment.text === notice.comment.text)) return prev
          return { ...prev, [autoOpenPostId]: [...current, { ...notice.comment, postedDay: day }] }
        })
      }
    }
  }, [autoOpenPostId, open, revealNotificationComment, day])

  useEffect(() => {
    setActiveStory(null)
  }, [day])

  return (
    <section
      aria-label="인스타그램"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'absolute inset-0 z-20 flex origin-[62%_42%] flex-col overflow-hidden bg-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:rounded-[55px]',
        open ? 'scale-100 opacity-100' : 'pointer-events-none scale-[0.2] opacity-0',
      )}
    >
      <header className="flex shrink-0 items-center justify-between px-[14px] pb-[4px] pt-[54px]">
        <h1 className={cn(logoFont.className, 'text-[32px] leading-none text-black')}>Instagram</h1>
        <div className="flex items-center gap-[20px] text-black">
          <span className="relative">
            <Heart className="size-[25px]" strokeWidth={1.9} aria-label="알림" />
            <span className="absolute right-0 top-0 size-[8px] rounded-full bg-[#FF3040] ring-2 ring-white" />
          </span>
          <Send className="size-[24px]" strokeWidth={1.9} aria-label="메시지" />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
        <ul className="flex gap-[14px] overflow-x-auto border-b border-black/[0.08] px-[12px] pb-[10px] pt-[8px] [scrollbar-width:none]">
          <li>
            <button
              type="button"
              onClick={hasMyStory ? onOpenMyStory : undefined}
              disabled={!hasMyStory}
              aria-label={hasMyStory ? '내 스토리 보기' : '내 스토리 (없음)'}
              className="flex w-[70px] flex-col items-center gap-[5px] transition-transform active:scale-95"
            >
              {hasMyStory ? (
                <StoryRing>
                  <Image src={MY_AVATAR} alt="" width={60} height={60} className="size-[60px] rounded-full object-cover" />
                </StoryRing>
              ) : (
                <span className="relative block p-[5px]">
                  <Image src={MY_AVATAR} alt="" width={60} height={60} className="size-[60px] rounded-full object-cover" />
                  <span
                    aria-hidden
                    className="absolute bottom-[4px] right-[4px] flex size-[20px] items-center justify-center rounded-full bg-[#0095F6] text-[16px] font-semibold leading-none text-white ring-2 ring-white"
                  >
                    +
                  </span>
                </span>
              )}
              <span className="text-[12px] text-black">내 스토리</span>
            </button>
          </li>
          {todayStories.map((item) => {
            const content = (
              <>
                <StoryRing state={storyStateOf(item.handle)}>
                  {item.src ? (
                    <Image src={item.src} alt="" width={60} height={60} className="size-[60px] rounded-full object-cover" />
                  ) : (
                    <span className="size-[60px] rounded-full bg-[#efefef]" aria-hidden />
                  )}
                </StoryRing>
                <span className="w-full truncate text-center text-[12px] text-black">{item.handle}</span>
              </>
            )
            return (
              <li key={item.handle} className="w-[70px] shrink-0">
                {item.story ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStory(item.story ?? null)
                      const key = seenKey(item.handle)
                      setSeenStories((prev) => (prev.includes(key) ? prev : [...prev, key]))
                    }}
                    aria-label={`${item.handle}님의 스토리 보기`}
                    className="flex w-full flex-col items-center gap-[5px] transition-transform active:scale-95"
                  >
                    {content}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-[5px]">{content}</div>
                )}
              </li>
            )
          })}
        </ul>

        {POSTS.map((post) => {
          const renderedPost = withOwner(post)
          const mine = post.handle === MY_HANDLE
          return (
            <PostCard
              key={post.id}
              post={renderedPost}
              comments={agedComments(commentsByPost[post.id] ?? post.comments)}
              storyState={mine ? (hasMyStory ? 'unseen' : 'none') : storyStateOf(post.handle)}
              onOpenComments={() => setActivePost(post.id)}
              onOpenProfile={
                mine ? () => setTab('profile') : PROFILES[renderedPost.handle] ? () => setActiveProfile(renderedPost.handle) : undefined
              }
            />
          )
        })}
      </div>

      <MyProfile
        open={tab === 'profile'}
        handle={ownerHandle}
        name={ownerName ?? ownerHandle}
        posts={MY_POSTS}
        onOpenPost={setMyFeedIndex}
        onOpenStory={onOpenMyStory}
        hasStory={hasMyStory}
      />

      <nav
        aria-label="인스타그램 탭"
        className="relative z-[26] flex shrink-0 items-center justify-around border-t border-black/[0.08] bg-white pb-[30px] pt-[10px] text-black"
      >
        <button type="button" onClick={() => setTab('home')} aria-label="홈" aria-current={tab === 'home' ? 'page' : undefined} className="p-1">
          <House className="size-[26px]" strokeWidth={tab === 'home' ? 2.4 : 1.9} aria-hidden />
        </button>
        <Search className="size-[26px]" strokeWidth={1.9} aria-label="검색" />
        <Clapperboard className="size-[26px]" strokeWidth={1.9} aria-label="릴스" />
        <SquarePlus className="size-[26px]" strokeWidth={1.9} aria-label="만들기" />
        <button
          type="button"
          onClick={() => setTab('profile')}
          aria-label="내 프로필"
          aria-current={tab === 'profile' ? 'page' : undefined}
          className={cn('rounded-full p-[1.5px] transition-transform active:scale-90', tab === 'profile' ? 'ring-2 ring-black' : '')}
        >
          <Image src={MY_AVATAR} alt="" width={27} height={27} className="size-[27px] rounded-full object-cover" />
        </button>
      </nav>

      <section
        aria-label="내 게시물"
        aria-hidden={myFeedIndex === null}
        inert={myFeedIndex === null}
        className={cn(
          'absolute inset-0 z-[28] flex flex-col bg-white text-black transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          myFeedIndex === null ? 'pointer-events-none translate-x-full' : 'translate-x-0',
        )}
      >
        <header className="flex shrink-0 items-center gap-[4px] border-b border-black/[0.08] px-[4px] pb-[6px] pt-[54px]">
          <button type="button" onClick={() => setMyFeedIndex(null)} aria-label="프로필로 돌아가기" className="flex size-[44px] items-center justify-center active:opacity-50">
            <ChevronLeft className="size-[28px]" strokeWidth={2} />
          </button>
          <h2 className="flex-1 text-center leading-tight">
            <span className="block text-[12px] font-semibold uppercase text-[#737373]">{ownerHandle}</span>
            <span className="block text-[16px] font-bold">게시물</span>
          </h2>
          <span className="size-[44px]" aria-hidden />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[30px] [scrollbar-width:none]">
          {myFeedIndex !== null &&
            MY_POSTS.map((post, index) => (
              <div
                key={post.id}
                ref={index === myFeedIndex ? (el) => el?.scrollIntoView({ block: 'start' }) : undefined}
              >
                <PostCard
                  post={withOwner(post)}
                  comments={agedComments(commentsByPost[post.id] ?? post.comments)}
                  storyState={hasMyStory ? 'unseen' : 'none'}
                  onOpenComments={() => setActivePost(post.id)}
                />
              </div>
            ))}
        </div>
      </section>

      <CommentsSheet
        open={open && activePost !== null}
        author={activePost ? withOwner(findPost(activePost) ?? POSTS[0]).handle : ''}
        ownerHandle={ownerHandle}
        ownerInitial={initial}
        ownerAvatar={MY_AVATAR}
        comments={activePost ? agedComments(commentsByPost[activePost] ?? findPost(activePost)?.comments ?? []) : []}
        onAdd={(text) => {
          if (!activePost) return
          setCommentsByPost((prev) => ({
            ...prev,
            [activePost]: [
              ...(prev[activePost] ?? findPost(activePost)?.comments ?? []),
              { name: ownerHandle, text, time: '방금', likes: 0, postedDay: day },
            ],
          }))
        }}
        onClose={() => setActivePost(null)}
      />

      <UserProfile
        profile={open && activeProfile ? (PROFILES[activeProfile] ?? null) : null}
        storyState={activeProfile ? storyStateOf(activeProfile) : 'none'}
        onClose={() => setActiveProfile(null)}
        onOpenPost={(handle) => {
          const post = POSTS.find((item) => item.handle === handle)
          if (post) {
            setActiveProfile(null)
            setActivePost(post.id)
          }
        }}
        onOpenStory={(handle) => {
          const story = todayStories.find((item) => item.handle === handle)?.story
          if (story) {
            setActiveProfile(null)
            setActiveStory(story)
            const key = seenKey(handle)
            setSeenStories((prev) => (prev.includes(key) ? prev : [...prev, key]))
          }
        }}
      />

      <FriendStoryViewer
        story={open ? activeStory : null}
        onClose={() => setActiveStory(null)}
        onOpenProfile={(handle) => {
          setActiveStory(null)
          if (handle === ownerHandle) setTab('profile')
          else if (PROFILES[handle]) setActiveProfile(handle)
        }}
      />

    </section>
  )
}
