'use client'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { COMMENT_AVATARS, DEFAULT_AVATAR, MY_AVATAR } from './instagram-data'

export type PostComment = {
  name: string
  text: string
  time: string
  likes: number
  mine?: boolean
  postedDay?: number
  /** 이 댓글 밑에 달린 답글 */
  replies?: PostComment[]
}

function CommentRow({ comment, isAuthor }: { comment: PostComment; isAuthor: boolean }) {
  const [liked, setLiked] = useState(false)
  const likes = comment.likes + (liked ? 1 : 0)

  return (
    <li className="flex gap-[12px] px-[16px] py-[10px]">
      <Image src={comment.mine ? MY_AVATAR : (COMMENT_AVATARS[comment.name] ?? DEFAULT_AVATAR)} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1 text-[14px] leading-[1.35] text-black">
        <p className="text-[13px]">
          <span className="font-semibold">{comment.name}</span>
          {isAuthor && <span className="text-[#737373]"> · 작성자</span>}
          <span className="text-[#737373]"> {comment.time}</span>
        </p>
        <p className="break-words">{comment.text}</p>
        <p className="mt-[4px] flex gap-[14px] text-[12px] font-semibold text-[#737373]">
          {likes > 0 && <span>좋아요 {likes}개</span>}
          <span>답글 달기</span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-label={liked ? '댓글 좋아요 취소' : '댓글 좋아요'}
        aria-pressed={liked}
        className="-mr-[10px] flex size-[44px] shrink-0 items-start justify-center pt-[6px] transition-transform active:scale-75"
      >
        <Heart className={cn('size-[14px] text-[#737373]', liked && 'fill-[#FF3040] text-[#FF3040]')} strokeWidth={2} />
      </button>
    </li>
  )
}

export function CommentsSheet({
  open,
  author,
  ownerHandle,
  ownerInitial,
  ownerAvatar,
  comments,
  choices,
  onChoose,
  onAdd,
  onClose,
}: {
  open: boolean
  author: string
  ownerHandle: string
  ownerInitial: string
  ownerAvatar?: string
  comments: PostComment[]
  /** 있으면 자유 입력 대신 댓글 선택지를 보여줍니다 */
  choices?: { id: string; comment: string }[]
  onChoose?: (id: string) => void
  onAdd: (text: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft('')
  }

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn('absolute inset-0 z-30 transition-opacity duration-300', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
    >
      <button type="button" aria-label="댓글 닫기" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <section
        role="dialog"
        aria-label="댓글"
        className={cn(
          'absolute inset-x-0 bottom-0 flex h-[78%] flex-col rounded-t-[18px] bg-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <header className="relative shrink-0 border-b border-black/[0.08] pb-[12px] pt-[8px] text-center">
          <span aria-hidden className="mx-auto mb-[12px] block h-[4px] w-[40px] rounded-full bg-black/20" />
          <h2 className="text-[16px] font-semibold text-black">댓글</h2>
        </header>

        <ul className="min-h-0 flex-1 overflow-y-auto py-[6px] [scrollbar-width:none]">
          {comments.map((comment, i) => (
            <li key={`${comment.name}-${i}`}>
              <ul>
                <CommentRow comment={comment} isAuthor={comment.name === author} />
              </ul>
              {comment.replies && comment.replies.length > 0 && (
                <ul className="pl-[46px]">
                  {comment.replies.map((reply, j) => (
                    <CommentRow key={`${reply.name}-${j}`} comment={reply} isAuthor={reply.name === author} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        {choices && choices.length > 0 ? (
          <div className="shrink-0 border-t border-black/[0.08] px-[14px] pb-[30px] pt-[12px]">
            <p className="pb-[8px] text-[12px] font-semibold text-[#737373]">댓글 선택</p>
            <ul className="flex flex-col gap-[8px]">
              {choices.map((choice) => (
                <li key={choice.id}>
                  <button
                    type="button"
                    onClick={() => onChoose?.(choice.id)}
                    className="flex w-full items-center gap-[10px] rounded-[14px] border border-black/[0.12] px-[12px] py-[10px] text-left text-[14px] text-black transition-colors active:bg-black/[0.05]"
                  >
                    {ownerAvatar ? (
                      <Image src={ownerAvatar} alt="" width={26} height={26} className="size-[26px] shrink-0 rounded-full object-cover" />
                    ) : null}
                    <span className="min-w-0 flex-1 break-words">{choice.comment}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex shrink-0 items-center gap-[10px] border-t border-black/[0.08] px-[14px] pb-[30px] pt-[10px]"
        >
          {ownerAvatar ? (
            <Image src={ownerAvatar} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-full object-cover" />
          ) : (
            <span aria-hidden className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f9a8d4] to-[#a78bfa] text-[13px] font-semibold text-white">
              {ownerInitial}
            </span>
          )}
          <label className="sr-only" htmlFor="comment-input">
            댓글 달기
          </label>
          <input
            id="comment-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              submit()
            }}
            placeholder={`${ownerHandle}(으)로 댓글 달기...`}
            className="h-[40px] min-w-0 flex-1 rounded-full border border-black/[0.12] px-[14px] text-[16px] text-black outline-none placeholder:text-[#737373] focus:border-black/30"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="h-[44px] shrink-0 px-[4px] text-[15px] font-semibold text-[#0095F6] disabled:opacity-40"
          >
            게시
          </button>
        </form>
        )}
      </section>
    </div>
  )
}
